import { http } from '../lib';
import {
  ClimbingArea,
  ClimbingAreaForecast,
  CreateAlertDTO,
  CreateGageDto,
  UserConfig,
  UserConfigDto,
} from '../types';
import { Endpoints } from '../enums';

export const initializeCron = async () => {
  return http.get(Endpoints.INIT).then((res) => res.data);
};

export const getGages = async () => {
  return http.get(Endpoints.GAGE).then((res) => res.data);
};

export const getSettings = async () => {
  return http.get(Endpoints.SETTINGS + `?id=1`).then((res) => res.data);
};

export const updateSettings = async (updateSettings: UserConfigDto) => {
  return http
    .put(Endpoints.SETTINGS + `?id=1`, updateSettings)
    .then((res) => res.data);
};

export const createGage = async (dto: CreateGageDto) => {
  return http.post(Endpoints.GAGE, dto).then((res) => res.data);
};

export const deleteGage = async (id: number) => {
  return http.delete(Endpoints.GAGE + `?id=${id}`).then((res) => res.data);
};

export const getGageSources = async (state: string) => {
  return http
    .get(Endpoints.GAGE_SOURCES + `?state=${state}`)
    .then((res) => res.data);
};

export const getAlerts = async () => {
  return http.get(Endpoints.ALERT).then((res) => res.data);
};

export const createAlert = async (createAlertDto: CreateAlertDTO) => {
  return http.post(Endpoints.ALERT, createAlertDto).then((res) => res.data);
};

export const deleteAlert = async (alertId: number) => {
  return http
    .delete(Endpoints.ALERT + `?id=${alertId}`)
    .then((res) => res.data);
};

export const getClimbingArea = async (): Promise<ClimbingArea[]> => {
  return http.get(Endpoints.CLIMBING_AREA).then((res) => res.data);
};

export const createClimbingArea = async (climbingArea: ClimbingArea) => {
  return http
    .post(Endpoints.CLIMBING_AREA, climbingArea)
    .then((res) => res.data);
};

export const deleteClimbingArea = async (areaId: number) => {
  return http
    .delete(Endpoints.CLIMBING_AREA + `?id=${areaId}`)
    .then((res) => res.data);
};

export const getClimbingAreaForecasts = async (): Promise<
  ClimbingAreaForecast[]
> => {
  return http.get(Endpoints.CLIMING_AREA_FORECAST).then((res) => res.data);
};
