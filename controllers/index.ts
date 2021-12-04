import { http } from "../lib";
import {CreateAlertDTO, CreateGageDto} from "../types";
import { Endpoints } from "../enums";

export const initializeCron = async () => {
  return http.get(Endpoints.INIT).then((res) => res.data);
};

export const getGages = async () => {
  return http.get(Endpoints.GAGE).then((res) => res.data);
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
  return http.post(Endpoints.ALERT,createAlertDto).then((res) => res.data);
};
