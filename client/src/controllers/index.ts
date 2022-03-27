import { http } from '../lib';
import * as qs from "qs"
import {
  CreateAlertDTO,
  CreateGageDto,
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
  return http.get(Endpoints.SETTINGS + `/1`).then((res) => res.data);
};

export const updateSettings = async (updateSettings: UserConfigDto) => {
  return http
    .put(Endpoints.SETTINGS, qs.stringify(updateSettings), {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    })
    .then((res) => res.data);
};

export const createGage = async (dto: CreateGageDto) => {
  return http.post(Endpoints.GAGE, qs.stringify(dto), {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  }).then(res => res.data)
}


export const deleteGage = async (id: number) => {
  return http.delete(Endpoints.GAGE + `/${id}`).then((res) => res.data);
};

export const getGageSources = async (state: string) => {
  return http
    .get(Endpoints.GAGE_SOURCES + `/${state}`)
    .then((res) => res.data);
};

export const getAlerts = async () => {
  return http.get(Endpoints.ALERT).then((res) => res.data);
};

export const createAlert = async (createAlertDto: CreateAlertDTO) => {
  return http.post(Endpoints.ALERT, qs.stringify(createAlertDto), {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  }).then((res) => res.data);
};

export const deleteAlert = async (alertId: number) => {
  return http
    .delete(Endpoints.ALERT + `/${alertId}`)
    .then((res) => res.data);
};
