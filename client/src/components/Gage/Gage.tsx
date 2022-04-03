import React, { useEffect, useState } from 'react';
import GageTable from './GageTable';
import { AutoComplete, Button, Form, Modal, notification, Select } from 'antd';
import { CreateGageDto, GageEntry, GageMetric } from '../../types';
import { useGagesContext } from '../Provider/GageProvider';
import { usStates } from '../../lib';
import { createGage } from '../../controllers';

const defaultForm: CreateGageDto = {
  Name: '',
  SiteId: '',
  Metric: GageMetric.CFS,
};

export const Gage = (): JSX.Element => {
  const [selectedState, setSelectedState] = useState('AL');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm, setCreateForm] = useState<CreateGageDto>(defaultForm);
  const { gageSources, loadGageSources, gages, loadGages } = useGagesContext();
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    [],
  );

  useEffect(() => {
    (async function () {
      await loadGageSources(selectedState);
    })();
  }, [selectedState]);

  const gagePreviouslyAdded = (entry: GageEntry): boolean => {
    const existingGageNames = gages.map((g) => g.Name);

    return existingGageNames.includes(entry.gageName);
  };

  const onSearch = (searchText: string) => {
    const vals = gageSources?.filter(
      (g) =>
        g.gageName
          .toLocaleLowerCase()
          .includes(searchText.toLocaleLowerCase()) && !gagePreviouslyAdded(g),
    );

    if (vals.length) {
      setOptions(
        vals.map((g) => ({
          value: g.siteId,
          label: g.gageName,
        })),
      );
    }
  };

  const handleClose = () => {
    setCreateForm(defaultForm);
    setCreateModalVisible(false);
  };

  const handleOk = async () => {
    try {
      const gageName = gageSources.find(
        (g) => g.siteId === createForm.SiteId,
      )?.gageName;

      await createGage({
        Name: gageName || 'Untitled',
        SiteId: createForm.SiteId,
        Metric: GageMetric.CFS,
      });
      await loadGages();
      notification.success({
        message: 'Gage Created',
        placement: 'bottomRight',
      });
      handleClose();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Modal
        destroyOnClose
        visible={createModalVisible}
        onOk={handleOk}
        onCancel={handleClose}
      >
        <Form
          wrapperCol={{
            span: 23,
          }}
          layout={'vertical'}
          onValuesChange={(val) => {
            setCreateForm(Object.assign({}, createForm, val));
          }}
          initialValues={createForm}
        >
          <Form.Item label={'State'}>
            <Select
              defaultValue={'AL'}
              onSelect={(val:string) => setSelectedState(val)}
            >
              {usStates.map((val, index) => (
                <Select.Option value={val.abbreviation} key={index}>
                  {val.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={'SiteId'} label={'Gage Name'}>
            <AutoComplete options={options} onSearch={onSearch} />
          </Form.Item>
        </Form>
      </Modal>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 24,
        }}
      >
        <Button
          type={'primary'}
          disabled={gages.length >= 15}
          onClick={() => setCreateModalVisible(true)}
        >
          Add Gage
        </Button>
      </div>
      <GageTable />
    </>
  );
};
