import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service';
import { sendSuccess } from '../utils/apiResponse';

export class ProfileController {
    public getProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;
            const profile = await profileService.getProfileByUserId(userId);

            return sendSuccess(res, {
                profile,
                hasProfile: profile !== null,
            });
        } catch (error) {
            next(error);
        }
    };

    public saveProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;
            const { name, mobile_number, address, business_name } = req.body;

            const profile = await profileService.upsertProfile(userId, {
                name,
                mobile_number,
                address,
                business_name,
            });

            return sendSuccess(res, profile, 'Profile saved successfully', 200);
        } catch (error) {
            next(error);
        }
    };
}

export const profileController = new ProfileController();
