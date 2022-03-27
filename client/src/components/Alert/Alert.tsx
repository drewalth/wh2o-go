import React, { useState } from 'react';
import { AlertTable } from './AlertTable';
import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Select,
  TimePicker,
} from 'antd';
import {
  AlertChannel,
  AlertCriteria,
  AlertInterval,
  CreateAlertDTO,
  GageMetric,
} from '../../types';
import { useGagesContext } from '../Provider/GageProvider';
import { createAlert } from '../../controllers';
import { useAlertsContext } from '../Provider/AlertProvider';
import moment from 'moment';

export const Alert = (): JSX.Element => {
  const { gages } = useGagesContext();
  const { loadAlerts } = useAlertsContext();

  const defaultCreateForm: CreateAlertDTO = {
    Name: '',
    Value: 0,
    Criteria: AlertCriteria.ABOVE,
    Channel: AlertChannel.EMAIL,
    Interval: AlertInterval.DAILY,
    NotifyTime: undefined,
    NextSend: undefined,
    Metric: GageMetric.CFS,
    Minimum: 0,
    Maximum: 0,
    UserID: 1
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateAlertDTO>(defaultCreateForm);

  const handleOk = async () => {
    try {
      const NotifyTime = moment(createForm.NotifyTime).format('YYYY-MM-DDTHH:mm:ss');

      await createAlert({
        ...createForm,
        NotifyTime
      });
      await loadAlerts();
      notification.success({
        message: 'Alert Created',
        placement: 'bottomRight',
      });
    } catch (e) {
      notification.error({
        message: 'Failed to create alert',
        placement: 'bottomRight',
      });
    } finally {
      setModalVisible(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Modal
        visible={modalVisible}
        destroyOnClose={true}
        title={'Add Alert'}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          layout={'vertical'}
          wrapperCol={{
            span: 23,
          }}
          onValuesChange={(evt) =>
            setCreateForm(Object.assign({}, createForm, evt))
          }
          initialValues={defaultCreateForm}
        >
          <Form.Item name={'Name'} label={'Name'}>
            <Input />
          </Form.Item>

          <Form.Item name={'Interval'} label={'Interval'}>
            <Select>
              {Object.values(AlertInterval).map((interval) => (
                <Select.Option key={interval} value={interval}>
                  {interval}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={'Channel'} label={'Channel'}>
            <Select>
              {Object.values(AlertChannel).map((el) => (
                <Select.Option
                  key={el}
                  value={el}
                  disabled={
                    el === AlertChannel.SMS &&
                    createForm.Interval === AlertInterval.DAILY
                  }
                >
                  {el}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={'GageID'}
            label={'Gage'}
            hidden={createForm.Interval === AlertInterval.DAILY}
          >
            <Select>
              {gages.map((gage) => (
                <Select.Option key={gage.SiteId} value={gage.ID}>
                  {gage.Name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={'NotifyTime'}
            label={'Time'}
            hidden={createForm.Interval === AlertInterval.IMMEDIATE}
          >
            <TimePicker use12Hours format="h:mm a" minuteStep={5} />
          </Form.Item>
          <Form.Item
            name={'Criteria'}
            label={'Criteria'}
            hidden={createForm.Interval === 'daily'}
          >
            <Select>
              {Object.values(AlertCriteria).map((el) => (
                <Select.Option key={el} value={el}>
                  {el}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={'Value'}
            label={'Value'}
            hidden={
              createForm.Interval === 'daily' ||
              createForm.Criteria === 'between'
            }
          >
            <Input type={'number'} />
          </Form.Item>
          <Form.Item
            name={'Minimum'}
            label={'Minimum'}
            hidden={
              createForm.Interval === 'daily' ||
              createForm.Criteria !== 'between'
            }
          >
            <Input type={'number'} max={createForm.Maximum} />
          </Form.Item>
          <Form.Item
            name={'Maximum'}
            label={'Maximum'}
            hidden={
              createForm.Interval === 'daily' ||
              createForm.Criteria !== 'between'
            }
          >
            <Input type={'number'} min={createForm.Minimum} />
          </Form.Item>
          <Form.Item
            name={'Metric'}
            label={'Metric'}
            hidden={createForm.Interval === 'daily'}
          >
            <Select>
              {Object.values(GageMetric).map((el) => (
                <Select.Option key={el} value={el}>
                  {el}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 24,
        }}
      >
        <Button
          disabled={!gages.length}
          type={'primary'}
          onClick={() => setModalVisible(true)}
        >
          Add Alert
        </Button>
      </div>
      <AlertTable />
    </>
  );
};
