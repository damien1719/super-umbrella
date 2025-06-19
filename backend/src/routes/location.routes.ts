import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.middleware';
import {
  createLocationSchema,
  updateLocationSchema,
  locationIdParam,
  locationFilterQuery,
} from '../schemas/location.schema';
import { bienIdParam } from '../schemas/bien.schema';
import { profileIdParam } from '../schemas/profile.schema';

export const locationRouter = Router();

// Shallow
locationRouter.get(
  '/',
  validateQuery(locationFilterQuery),
  LocationController.list,
);
locationRouter.get(
  '/:locId',
  validateParams(locationIdParam),
  LocationController.get,
);
locationRouter.post(
  '/',
  validateBody(createLocationSchema),
  LocationController.create,
);
locationRouter.patch(
  '/:locId',
  validateParams(locationIdParam),
  validateBody(updateLocationSchema),
  LocationController.update,
);
locationRouter.delete(
  '/:locId',
  validateParams(locationIdParam),
  LocationController.remove,
);

// Nested property/profile
locationRouter.get(
  '/properties/:bienId/location',
  validateParams(bienIdParam),
  LocationController.getByProperty,
);
locationRouter.post(
  '/properties/:bienId/location',
  validateParams(bienIdParam),
  validateBody(createLocationSchema),
  LocationController.createForProperty,
);


locationRouter.get(
  '/profiles/:profileId/locations',
  validateParams(profileIdParam),
  LocationController.listForProfile,
);

locationRouter.post(
  '/profiles/:profileId/locations',
  validateParams(profileIdParam),
  validateBody(createLocationSchema),
  LocationController.createForProfile,
);
