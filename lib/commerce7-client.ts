import axios from 'axios';
import { env } from 'bun';
import { z } from 'zod';
import api from './api-client';

const baseUrl = 'https://api.commerce7.com/v1';

const api = axios.create({
  baseURL: baseUrl,
  auth: {
    username: env.C7_APP_ID,
    password: env.C7_APP_SECRET,
  },
});

const envSchema = z.object({
  appId: z.string(),
  appSecret: z.string(),
});

export type UpdateTagReqBody = {
  title: string;
  type: 'Manual' | 'Dynamic';
};
class Commerce7Api {
  constructor() {
    this._validateRequiredEnvVariables();
  }

  private _validateRequiredEnvVariables() {
    const result = envSchema.safeParse({
      appId: env.C7_APP_ID,
      appSecret: env.C7_APP_SECRET,
    });
    if (!result.success) {
      throw new Error(
        'Commerce7 App Id and Secret environment variables must be defined'
      );
    }
  }

  async updateOrderTag(
    tenantId: string,
    tagId: string,
    body: UpdateTagReqBody
  ) {
    try {
      const response = await api.put(`/tag/order/${tagId}`, body, {
        headers: {
          tenant: tenantId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating tag: ', error);
      throw error;
    }
  }
}

export default Commerce7Api;
