import fs from 'fs';
import util from 'util';
import { celebrate, Joi, Segments } from 'celebrate';
import { Router, Request, Response, NextFunction } from 'express';
import Container from 'typedi';
import { UpdatedPolicyResponse } from '../../interfaces/updatedPolicyResponse';
import { PolicyInput } from '../../interfaces/policyInput';
import ChecksService from '../../services/checks';
import PolicyService from '../../services/policy';
import S3Service from '../../services/s3';
import SesService from '../../services/ses';
import LoginService from '../../services/login';
import errors from '../../utils/errors';

const unlinkFile = util.promisify(fs.unlink); // To delete the file from local after uploading on s3
const upload = multer({ dest: '/tmp/files/' }); // Only /tmp folder is writable in AWS Lambda environments

const route = Router();

export default (app: Router): void => {
  app.use('/policy', route);

  const postPolicyInputSchema = {
    [Segments.BODY]: Joi.object().keys({
      authToken: Joi.string().alphanum().min(2).required().messages({
        // Here's how you may set custom error messages
        'string.alphanum': 'User ID is invalid',
        'string.min': 'User ID is too short',
      }),
      policies: Joi.array()
        .items(
          Joi.object({
            policyId: Joi.string().required(),
            vehicleDetails: Joi.object({
              regNumber: Joi.string().required(),
              type: Joi.string().required(),
            }).required(),
            initialReading: Joi.string().required(),
            activationDate: Joi.string().required(),
            expiryDate: Joi.string().required(),
            kmsPurchased: Joi.number().required(),
          }),
        )
        .required(),
    }),
  };

  //post api which gets updated data from spa at each login
  route.post('/', celebrate(postPolicyInputSchema), async (req: Request, res: Response, next: NextFunction) => {
    req.log.apiName = 'POST-POLICY';
    try {
      //TODO: get authToken in header and change that in "policy.test" file also
      const authToken = req.body.authToken;
      const userId = await Container.get(LoginService).getUserId(authToken);
      const policies: PolicyInput = {
        userId: userId,
        policies: req.body.policies,
      };

      const updatedPolicies = await Container.get(PolicyService).createOrUpdatePolicy(policies);

      const policiesResponse: UpdatedPolicyResponse[] = [];

      for (let i = 0; i < updatedPolicies.length; i++) {
        const policyResponse: UpdatedPolicyResponse = {
          policyId: updatedPolicies[i].policyId,
          latestOdometerReading: Container.get(ChecksService).getLatestOdometerReading(updatedPolicies[i]),
          remainingKms: 0,
          showTopUpReminder: false,
          showUploadReadingReminder: Container.get(ChecksService).getUploadReadingReminder(updatedPolicies[i]),
        };
        policyResponse.remainingKms = Container.get(ChecksService).getRemainingKms(
          updatedPolicies[i].initialReading,
          updatedPolicies[i].kmsPurchased,
          policyResponse.latestOdometerReading,
        );

        //TODO:  show top up reminder check

        policiesResponse.push(policyResponse);
      }
      res.status(200).json(policiesResponse);
    } catch (error) {
      next(error);
    }
  });

  const postReadingInputSchema = {
    [Segments.BODY]: {
      authToken: Joi.string().min(2).required(),
      policyId: Joi.string().required(),
      readingValue: Joi.string().required(),
    },
  };

  //post api which lets user post new reading with image
  //user multer middleware before celebrate
  route.post(
    '/uploadReading',
    upload.single('readingImage'),
    celebrate(postReadingInputSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      req.log.apiName = 'POST-READING';
      try {
        //TODO: get authToken in header and change that in "policy.test" file also
        const { authToken, policyId, readingValue } = req.body as {
          authToken: string;
          policyId: string;
          readingValue: string;
        };
        const userId = await Container.get(LoginService).getUserId(authToken);
        const file = req.file;
        if (file === undefined) {
          throw new errors.BadRequestError('Unable to get file');
        }
        const result = await Container.get(S3Service).uploadFileToBucket(file);
        await unlinkFile(file.path);
        const policy = await Container.get(PolicyService).addReading(userId, policyId, readingValue, result.Location);
        if (policy.readings === undefined || policy.latestOdometerReading === undefined) {
          throw new errors.BadRequestError('Unable to update item in DB');
        }
        res.status(200).json(policy);
      } catch (error) {
        next(error);
      }
    },
  );

  const postReadingsHistoryInputSchema = {
    [Segments.BODY]: {
      authToken: Joi.string().min(2).required(),
      policyId: Joi.string().required(),
    },
  };

  //get api which lets user get its all previous readings
  route.post(
    '/readings',
    celebrate(postReadingsHistoryInputSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      req.log.apiName = 'GET-READINGS';
      try {
        //TODO: get authToken in header and change that in "policy.test" file also
        const authToken = req.body.authToken;
        const userId = await Container.get(LoginService).getUserId(authToken);
        const policyId = req.body.policyId as string;
        const readings = await Container.get(PolicyService).getReadingHistory(userId, policyId);
        res.status(200).json(readings);
      } catch (error) {
        next(error);
      }
    },
  );

  const postRechargeInputSchema = {
    [Segments.BODY]: {
      authToken: Joi.string().min(2).required(),
      policyId: Joi.string().required(),
      topUpKms: Joi.number().required(),
    },
  };

  //get api that sends an email to designated email Id when a user request for top up recharge
  route.post(
    '/recharge',
    celebrate(postRechargeInputSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      req.log.apiName = 'POST-RECHARGE';
      try {
        //TODO: get authToken in header and change that in "policy.test" file also
        const { authToken, policyId, topUpKms } = req.body as { authToken: string; policyId: string; topUpKms: number };
        const userId = await Container.get(LoginService).getUserId(authToken);

        await Container.get(PolicyService).checkIfPolicyExists(userId, policyId);
        await Container.get(SesService).sendEmail(userId, policyId, topUpKms);
        res.status(200).json({
          message: 'email sent succesfully',
        });
      } catch (error) {
        next(error);
      }
    },
  );
};
