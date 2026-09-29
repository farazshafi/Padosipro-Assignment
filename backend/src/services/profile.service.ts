import { query } from '../db';

export interface ProfileInput {
    name: string;
    mobile_number: string;
    address: string;
    business_name?: string | null;
}

export interface ProfileResponse extends ProfileInput {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export class ProfileService {
    /**
     * Retrieves profile for a user
     */
    public async getProfileByUserId(userId: string): Promise<ProfileResponse | null> {
        const res = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
        if (res.rows.length === 0) {
            return null;
        }
        return res.rows[0];
    }

    /**
     * Inserts or updates profile record for a user
     */
    public async upsertProfile(userId: string, data: ProfileInput): Promise<ProfileResponse> {
        const { name, mobile_number, address, business_name } = data;
        const cleanBusinessName = business_name && business_name.trim() ? business_name.trim() : null;

        const upsertQuery = `
      INSERT INTO profiles (user_id, name, mobile_number, address, business_name)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        mobile_number = EXCLUDED.mobile_number,
        address = EXCLUDED.address,
        business_name = EXCLUDED.business_name,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

        const res = await query(upsertQuery, [
            userId,
            name.trim(),
            mobile_number.trim(),
            address.trim(),
            cleanBusinessName,
        ]);

        return res.rows[0];
    }
}

export const profileService = new ProfileService();
