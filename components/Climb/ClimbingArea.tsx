import React, { useState } from 'react'
import {
  AutoComplete,
  Button,
  Form,
  Modal,
  Select,
  Table,
  notification,
} from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useClimbContext } from '../Provider/ClimbProvider/ClimbContext'
import { usStates, usClimbingAreas } from '../../lib'
import { createClimbingArea, deleteClimbingArea } from '../../controllers'
import { AreaForecast } from './AreaForecast'

export const ClimbingArea = () => {
  const { areas, loadAreas, forecasts } = useClimbContext()
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [createForm, setCreateForm] = useState<{ areaId: number }>({
    areaId: 0,
  })
  const [selectedState, setSelectedState] = useState('CO')

  const hasForecast = (areaId: number) => {
    const areasWForecast = new Set(forecasts.map((f) => f.areaId))
    return areasWForecast.has(areaId)
  }

  const handleDelete = async (areaId: number) => {
    try {
      await deleteClimbingArea(areaId)
      await loadAreas()
      notification.success({
        message: 'Area removed',
        placement: 'bottomRight',
      })
    } catch (e) {
      console.error(e)
      notification.error({
        message: 'failed to remove area',
        placement: 'bottomRight',
      })
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'id',
      key: 'description',
    },
    {
      dataIndex: 'id',
      key: 'id',
      render: (val: number) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(val)}
            danger
          />
        </div>
      ),
    },
  ]

  const handleOk = async () => {
    try {
      const el = usClimbingAreas.find((val) => val.areaId === createForm.areaId)
      if (el) {
        await createClimbingArea(el)
        await loadAreas()
        setCreateModalVisible(false)
        notification.success({
          message: 'Area added',
          placement: 'bottomRight',
        })
      } else {
        throw new Error('something went wrong')
      }
    } catch (e) {
      console.log(e)
      notification.error({
        message: 'Failed to add area',
        placement: 'bottomRight',
      })
    }
  }

  const handleClose = () => {
    setCreateModalVisible(false)
    setCreateForm({ areaId: 0 })
  }

  return (
    <div>
      <Modal
        destroyOnClose
        visible={createModalVisible}
        onOk={handleOk}
        onCancel={handleClose}
      >
        <Form
          onValuesChange={(val) => {
            setCreateForm({
              areaId: Number(Object.values(val)[0]),
            })
          }}
        >
          <Form.Item label={'State'}>
            <Select
              defaultValue={'CO'}
              onSelect={(val) => setSelectedState(val)}
            >
              {usStates.map((val, index) => (
                <Select.Option value={val.abbreviation} key={index}>
                  {val.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={'areaId'} label={'Area'}>
            <Select>
              {usClimbingAreas
                .filter((a) => a.adminArea === selectedState)
                .filter(
                  (v) => !areas.map((area) => area.areaId).includes(v.areaId)
                )
                .map((val, index) => (
                  <Select.Option value={val.areaId} key={index}>
                    {val.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <div
        style={{
          width: '100%',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          type={'primary'}
          onClick={() => setCreateModalVisible(true)}
          disabled={areas.length >= 15}
        >
          Add Area
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={areas}
        expandable={{
          expandedRowRender: (record) => (
            <AreaForecast
              forecast={forecasts.find((f) => f.areaId === record.areaId)}
            />
          ),
          rowExpandable: (record) => hasForecast(record.areaId),
        }}
      />
    </div>
  )
}
