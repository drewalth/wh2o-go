import React, { useState } from 'react'
import { AlertTable } from './AlertTable'
import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Select,
  TimePicker,
} from 'antd'
import { CreateAlertDto, GageMetric } from '../../types'
import { AlertChannel, AlertCriteria, AlertInterval } from '../../enums'
import { useGagesContext } from '../Provider/GageProvider'
import { createAlert } from '../../controllers'
import { useAlertsContext } from '../Provider/AlertProvider'
import moment from 'moment'

const defaultCreateForm: CreateAlertDto = {
  name: '',
  value: 1.0,
  active: true,
  criteria: AlertCriteria.ABOVE,
  channel: AlertChannel.EMAIL,
  interval: AlertInterval.DAILY,
  notifyTime: undefined,
  nextSend: undefined,
  metric: GageMetric.CFS,
  minimum: 1.0,
  maximum: 1.0,
  userId: 1,
}

export const Alert = (): JSX.Element => {
  const { gages } = useGagesContext()
  const { loadAlerts } = useAlertsContext()
  const [modalVisible, setModalVisible] = useState(false)
  const [createForm, setCreateForm] =
    useState<CreateAlertDto>(defaultCreateForm)

  const handleOk = async () => {
    try {
      const notifyTime = moment(createForm.notifyTime).format(
        'YYYY-MM-DDTHH:mm:ss',
      )
      await createAlert({
        ...createForm,
        value: Number(createForm.value),
        notifyTime,
      })
      await loadAlerts()
      notification.success({
        message: 'Alert Created',
        placement: 'bottomRight',
      })
    } catch (e) {
      notification.error({
        message: 'Failed to create alert',
        placement: 'bottomRight',
      })
    } finally {
      setModalVisible(false)
    }
  }

  const handleFormValueChange = (val) =>
    setCreateForm(Object.assign({}, createForm, val))

  const handleCancel = () => {
    setModalVisible(false)
  }

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
          // @ts-ignore
          ref={formRef}
          layout={'vertical'}
          wrapperCol={{
            span: 23,
          }}
          onValuesChange={handleFormValueChange}
          initialValues={defaultCreateForm}
        >
          <Form.Item name={'name'} label={'Name'}>
            <Input />
          </Form.Item>

          <Form.Item name={'interval'} label={'Interval'}>
            <Select>
              {Object.values(AlertInterval).map((interval) => (
                <Select.Option key={interval} value={interval}>
                  {interval}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={'channel'} label={'Channel'}>
            <Select>
              {Object.values(AlertChannel).map((el) => (
                <Select.Option
                  key={el}
                  value={el}
                  disabled={
                    el === AlertChannel.SMS &&
                    createForm.interval === AlertInterval.DAILY
                  }
                >
                  {el}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={'gageId'}
            label={'Gage'}
            hidden={createForm.interval === AlertInterval.DAILY}
          >
            <Select>
              {gages.map((gage) => (
                <Select.Option key={gage.siteId} value={gage.id}>
                  {gage.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={'notifyTime'}
            label={'Time'}
            hidden={createForm.interval === AlertInterval.IMMEDIATE}
          >
            <TimePicker use12Hours format="h:mm a" minuteStep={5} />
          </Form.Item>
          <Form.Item
            name={'criteria'}
            label={'Criteria'}
            hidden={createForm.interval === 'DAILY'}
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
            name={'value'}
            label={'Value'}
            hidden={
              createForm.interval === 'DAILY' ||
              createForm.criteria === 'BETWEEN'
            }
          >
            <Input type={'number'} />
          </Form.Item>
          <Form.Item
            name={'Minimum'}
            label={'Minimum'}
            hidden={
              createForm.interval === 'DAILY' ||
              createForm.criteria !== 'BETWEEN'
            }
          >
            <Input type={'number'} max={createForm.maximum} />
          </Form.Item>
          <Form.Item
            name={'maximum'}
            label={'Maximum'}
            hidden={
              createForm.interval === 'DAILY' ||
              createForm.criteria !== 'BETWEEN'
            }
          >
            <Input type={'number'} min={createForm.minimum} />
          </Form.Item>
          <Form.Item
            name={'metric'}
            label={'Metric'}
            hidden={createForm.interval === 'DAILY'}
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
  )
}
