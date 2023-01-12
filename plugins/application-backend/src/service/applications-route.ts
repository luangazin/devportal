import { Router } from "express";
import express from 'express';

import { RouterOptions } from "./router";
import { PostgresApplicationRepository } from "../modules/applications/repositories/knex/KnexApplicationRepository";
import { ServerTokenManager } from "@backstage/backend-common";
import { InputError } from "@backstage/errors";
import { ApplicationDto } from "../modules/applications/dtos/ApplicationDto";
import { ApplicationServices } from "../modules/applications/services/ApplicationServices";

/** @public */
export async function createApplicationRouter(
    options: RouterOptions,
  ): Promise<Router> {
  
    const applicationRepository = await PostgresApplicationRepository.create(
      await options.database.getClient(),
    );

    const router = Router()
    router.use(express.json())


    router.get('/', async (request, response) => {
        try {
          const limit: number = request.query.limit as any;
          const offset: number = request.query.offset as any;
          const responseData = await applicationRepository.getApplication(
            limit,
            offset,
          );
          return response.json({ status: 'ok', applications: responseData });
        } catch (error: any) {
          let date = new Date();
          return response.status(error.response.status).json({
            status: 'ERROR',
            message: error.response.data.errorSummary,
            timestamp: new Date(date).toISOString(),
          });
        }
      });
    
      router.post('/', async (request, response) => {
        const data = request.body.application;
        await ApplicationServices.Instance.createApplication(data, options);
        try {
          if (!data) {
            throw new InputError(
              `the request body is missing the application field`,
            );
          }
          
          const result = await applicationRepository.createApplication(data);
          response.send({ status: 'ok', result: result });
        } catch (error: any) {
          let date = new Date();
          response.status(error.response.status).json({
            status: 'ERROR',
            message: error.response.data.errorSummary,
            timestamp: new Date(date).toISOString(),
          });
        }
      });
    
      router.post('/save', async (request, response) => {
        const data: ApplicationDto = request.body.application;
        try {
          if (!data) {
            throw new InputError(
              `the request body is missing the application field`,
            );
          }
          // logger.info(JSON.stringify(data))
          const result = await applicationRepository.createApplication(data);
          response.send({ status: data, result: result });
        } catch (error: any) {
          let date = new Date();
          response.status(error.response.status).json({
            status: 'ERROR',
            message: error.response.data.errorSummary,
            timestamp: new Date(date).toISOString(),
          });
        }
      });
    
      router.get('/:id', async (request, response) => {
        const code = request.params.id;
        try {
          if (!code) {
            throw new InputError(
              `the request body is missing the application field`,
            );
          }
          const result = await applicationRepository.getApplicationById(code);
          response.send({ status: 'ok', application: result });
        } catch (error: any) {
          let date = new Date();
          response.status(error.response.status).json({
            status: 'ERROR',
            message: error.response.data.errorSummary,
            timestamp: new Date(date).toISOString(),
          });
        }
      });


    return router;

  }