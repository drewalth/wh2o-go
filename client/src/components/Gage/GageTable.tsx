import React, { useState } from 'react'
import {
  Button,
  Modal,
  notification,
  Select,
  Table,
  Tooltip,
  Typography,
} from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useGagesContext } from '../Provider/GageProvider'
import { deleteGage, updateGage } from '../../controllers'
import moment from 'moment'
import { Gage, GageMetric, GageReading } from '../../types'
import { ReadingSelect } from './ReadingSelect'

const GageTable = (): JSX.Element => {
  const { gages, loadGages } = useGagesContext()
  const [pendingDelete, setPendingDelete] = useState(0)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Tooltip title={name} placement={'top'}>
          <Typography.Text ellipsis>{name}</Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: 'Primary Metric',
      dataIndex: 'metric',
      key: 'metric',
      render: (metric: GageMetric, gage: Gage) => (
        <Select
          value={metric}
          bordered={false}
          size={'small'}
          onChange={async (metric: GageMetric) => {
            debugger
            await updateGage({
              ...gage,
              metric,
            })
            await loadGages()
          }}
        >
          {Object.values(GageMetric).map((m) => (
            <Select.Option value={m} key={m}>
              {m}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Readings',
      dataIndex: 'readings',
      key: 'readings',
      render: (readings: GageReading[]) => (
        <div style={{ minWidth: 150 }}>
          <ReadingSelect readings={readings} />
        </div>
      ),
    },
    // {
    //   title: 'Delta',
    //   dataIndex: 'delta',
    //   key: 'delta',
    // },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (val: Date) => {
        if (val) {
          return (
            <div style={{ maxWidth: 200 }}>
              <Typography.Text ellipsis>
                {moment(val).format('llll')}
              </Typography.Text>
            </div>
          )
        }
        return '-'
      },
    },
    {
      dataIndex: 'id',
      key: 'id',
      render: (val: number) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={() => initiateDelete(val)}
            icon={<DeleteOutlined />}
            danger
          />
        </div>
      ),
    },
  ]

  const initiateDelete = async (id: number) => {
    setPendingDelete(id)
    setDeleteModalVisible(true)
  }

  const handleClose = () => {
    setDeleteModalVisible(false)
    setPendingDelete(0)
  }

  const handleOk = async () => {
    try {
      await deleteGage(pendingDelete)
      handleClose()
      await loadGages()
      notification.success({
        message: 'Gage Deleted',
        placement: 'bottomRight',
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <div style={{ position: 'relative', width: '100%', overflowX: 'scroll' }}>
        <Table
          rowKey={(record) => record.id}
          dataSource={gages || []}
          columns={columns}
        />
      </div>
      <Modal
        title="Are you sure?"
        visible={deleteModalVisible}
        onOk={handleOk}
        onCancel={handleClose}
      >
        <p>
          This will remove all associated notifications. This cannot be undone.
        </p>
      </Modal>
    </>
  )
}

export default GageTable
