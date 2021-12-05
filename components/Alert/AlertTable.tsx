import React, { useEffect, useState } from 'react'
import { useAlertsContext } from '../Provider/AlertProvider'
import { Button, Table, notification, Tag } from 'antd'
import { Alert } from '../../types'
import { useGagesContext } from '../Provider/GageProvider'
import { DeleteOutlined } from '@ant-design/icons'
import { deleteAlert } from '../../controllers'
import moment from 'moment'

export const AlertTable = (): JSX.Element => {
  const { alerts, loadAlerts } = useAlertsContext()
  const { gages } = useGagesContext()

  const getIntervalTag = (alert: Alert): JSX.Element => {
    return (
      <Tag color={alert.interval === 'daily' ? 'blue' : 'red'}>
        {alert.interval}
      </Tag>
    )
  }

  const getChannelTag = (alert: Alert): JSX.Element => {
    return (
      <Tag color={alert.channel === 'email' ? 'green' : 'orange'}>
        {alert.channel}
      </Tag>
    )
  }

  const handleDelete = async (val: number) => {
    try {
      await deleteAlert(val)
      await loadAlerts()
      notification.success({
        message: 'Alert deleted',
        placement: 'bottomRight',
      })
    } catch (e) {
      notification.error({
        message: 'Failed to Delete Alert',
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
    // {
    //   title: "Gage",
    //   dataIndex: "gageId",
    //   key: "gageId",
    //   render: (val: number) => {
    //     const gage = gages.find((g) => g.id === val);
    //     return gage?.name || "err";
    //   },
    // },
    {
      title: 'Description',
      dataIndex: 'id',
      key: 'description',
      render: (val: number, alert: Alert) => {
        // let test = "";
        //
        // test += alert.criteria;
        //
        // if (alert.criteria === "between") {
        //   test += " " + alert.minimum + "-" + alert.maximum;
        // } else {
        //   test += " " + alert.value;
        // }
        //
        // test += " " + alert.metric;

        return (
          <>
            {getIntervalTag(alert)}
            {getChannelTag(alert)}
            {`@ ${moment(alert.notifyTime).format('h:mm a')}`}
          </>
        )
      },
    },
    {
      dataIndex: 'id',
      key: 'id',
      render: (val: number) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={() => handleDelete(val)}
            icon={<DeleteOutlined />}
            danger
          />
        </div>
      ),
    },
  ]

  return <Table columns={columns} dataSource={alerts} />
}
