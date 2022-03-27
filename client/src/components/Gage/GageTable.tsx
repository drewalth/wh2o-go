import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  notification,
  Select,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useGagesContext } from '../Provider/GageProvider';
import { deleteGage } from '../../controllers';
import moment from 'moment';
import { Gage, GageMetric, GageReading } from '../../types';

type ReadingSelectProps = {
  readings: GageReading[];
};

const ReadingSelect = ({ readings }: ReadingSelectProps): JSX.Element => {
  const [activeMetric, setAcitveMetric] = useState<GageMetric>(GageMetric.CFS);
  const [reading, setReading] = useState<number>();
  const metrics = Array.from(new Set(readings?.map((r) => r.Metric)));
  useEffect(() => {
    const val = readings?.filter((r) => r.Metric === activeMetric)[0]?.Value;

    setReading(val);
  }, [activeMetric, readings]);

  const renderReading = () => {
    if (activeMetric === GageMetric.TEMP) {
      return (
        <span>
          {reading}
          &nbsp;&deg;C
        </span>
      );
    }

    if (reading === -999999) {
      return 'Disabled';
    }

    return reading;
  };

  return (
    <div>
      {renderReading()}
      {(metrics.length > 0 && reading !== -999999) && (
        <Select
          defaultValue={'CFS'}
          bordered={false}
          size={'small'}
          onSelect={(val:string) => setAcitveMetric(val as GageMetric)}
        >
          {metrics.map((m, index) => (
            <Select.Option key={m + index} value={m}>
              {m}
            </Select.Option>
          ))}
        </Select>
      )}
    </div>
  );
};

const GageTable = (): JSX.Element => {
  const { gages, loadGages } = useGagesContext();
  const [pendingDelete, setPendingDelete] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'Name',
      render: (name: string) => (
        <Tooltip title={name} placement={'top'}>
          <Typography.Text ellipsis>{name}</Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: 'Readings',
      dataIndex: 'GageReadings',
      key: 'GageReadings',
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
      dataIndex: 'UpdatedAt',
      key: 'UpdatedAt',
      render: (val: Date) => {
        if (val) {
          return (
            <div style={{ maxWidth: 200 }}>
              <Typography.Text ellipsis>
                {moment(val).format('llll')}
              </Typography.Text>
            </div>
          );
        }
        return '-';
      },
    },
    {
      dataIndex: 'ID',
      key: 'ID',
      render: (val: number) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={() => intiateDelete(val)}
            icon={<DeleteOutlined />}
            danger
          />
        </div>
      ),
    },
  ];

  const intiateDelete = async (id: number) => {
    setPendingDelete(id);
    setDeleteModalVisible(true);
  };

  const handleClose = () => {
    setDeleteModalVisible(false);
    setPendingDelete(0);
  };

  const handleOk = async () => {
    try {
      await deleteGage(pendingDelete);
      handleClose();
      await loadGages();
      notification.success({
        message: 'Gage Deleted',
        placement: 'bottomRight',
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <div style={{ position: 'relative', width: '100%', overflowX: 'scroll' }}>
        <Table dataSource={gages || []} columns={columns} />
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
  );
};

export default GageTable;
