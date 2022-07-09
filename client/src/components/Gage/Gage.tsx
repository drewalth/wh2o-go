import React, { useRef, useState } from 'react'
import GageTable from './GageTable'
import { AutoComplete, Button, Form, Modal, notification, Select } from 'antd'
import {
  Country,
  CreateGageDto,
  GageEntry,
  GageMetric,
  GageSource,
} from '../../types'
import { useGagesContext } from '../Provider/GageProvider'
import { createGage } from '../../controllers'
import { canadianProvinces, StateEntry, usStates } from '../../lib'

const defaultForm: CreateGageDto = {
  name: '',
  siteId: '',
  metric: GageMetric.CFS,
  userId: 1,
  country: Country.US,
  state: 'AL',
  source: GageSource.USGS,
}

const getCountryLabel = (c: Country) => {
  switch (c) {
    case Country.NZ:
      return 'New Zealand'
    case Country.US:
      return 'United States'
    case Country.CL:
      return 'Chile'
    default:
    case Country.CA:
      return 'Canada'
  }
}

const getGageSourceLabel = (s: GageSource) => {
  switch (s) {
    case GageSource.ENVIRONMENT_AUCKLAND:
      return 'Environment Auckland'
    case GageSource.ENVIRONMENT_CANADA:
      return 'Environment Canada'
    case GageSource.ENVIRONMENT_CHILE:
      return 'Environment Chile'
    case GageSource.USGS:
      return 'USGS'
  }
}

export const Gage = (): JSX.Element => {
  const formRef = useRef<HTMLFormElement>(null)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [createForm, setCreateForm] = useState<CreateGageDto>(defaultForm)
  const { gageSources, gages, loadGages, loadGageSources } = useGagesContext()
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  const gagePreviouslyAdded = (entry: GageEntry): boolean => {
    const existingGageNames = gages.map((g) => g.name)

    return existingGageNames.includes(entry.gageName)
  }

  const onSearch = (searchText: string) => {
    const vals = gageSources?.filter(
      (g) =>
        g.gageName
          .toLocaleLowerCase()
          .includes(searchText.toLocaleLowerCase()) && !gagePreviouslyAdded(g),
    )

    if (vals.length) {
      setOptions(
        vals.map((g) => ({
          value: g.siteId,
          label: g.gageName,
        })),
      )
    }
  }

  const properties = {
    [Country.US]: {
      states: usStates,
      sources: [GageSource.USGS],
      setFields: () => setFormAttributes(Country.US),
    },
    [Country.CA]: {
      states: canadianProvinces,
      sources: [GageSource.ENVIRONMENT_CANADA],
      setFields: () => setFormAttributes(Country.CA),
    },
    [Country.NZ]: {
      states: [{ abbreviation: '--', name: '--' }] as StateEntry[],
      sources: [GageSource.ENVIRONMENT_AUCKLAND],
      setFields: () => setFormAttributes(Country.NZ),
    },
    [Country.CL]: {
      states: [{ abbreviation: '--', name: '--' }] as StateEntry[],
      sources: [GageSource.ENVIRONMENT_CHILE],
      setFields: () => setFormAttributes(Country.CL),
    },
  }

  const setFormAttributes = (country: Country) => {
    setCreateForm({
      ...createForm,
      country,
      state: properties[country].states[0].abbreviation,
      source: properties[country].sources[0],
    })

    if (formRef && formRef.current) {
      const form = formRef.current
      form.setFields([
        {
          name: 'country',
          value: country,
        },
        {
          name: 'state',
          value: properties[country].states[0].abbreviation,
        },
        {
          name: 'source',
          value: properties[country].sources[0],
        },
        {
          name: 'name',
          value: '',
        },
      ])
    }
  }

  const handleFormValueChange = async (val) => {
    if (val.country) {
      await loadGageSources(
        val.country,
        properties[val.country].states[0].abbreviation,
      )
      properties[val.country].setFields()
    } else {
      setCreateForm(Object.assign({}, createForm, val))
    }
  }

  const handleClose = () => {
    setCreateForm(defaultForm)
    setCreateModalVisible(false)
  }

  const handleOk = async () => {
    try {
      const gageName = gageSources.find(
        (g) => g.siteId === createForm.siteId,
      )?.gageName

      await createGage({
        ...createForm,
        name: gageName || 'Untitled',
        siteId: createForm.siteId,
        metric: GageMetric.CFS,
      })
      await loadGages()
      notification.success({
        message: 'Gage Created',
        placement: 'bottomRight',
      })
      handleClose()
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <Modal
        destroyOnClose
        visible={createModalVisible}
        onOk={handleOk}
        onCancel={handleClose}
      >
        <Form
          // @ts-ignore
          ref={formRef}
          wrapperCol={{
            span: 23,
          }}
          layout={'vertical'}
          onValuesChange={handleFormValueChange}
          initialValues={createForm}
        >
          <Form.Item label={'Country'} name={'country'}>
            <Select>
              {Object.values(Country).map((c) => (
                <Select.Option key={c} value={c}>
                  {getCountryLabel(c)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label={'Source'} name={'source'}>
            <Select>
              {properties[createForm.country].sources.map((s) => (
                <Select.Option key={s} value={s}>
                  {getGageSourceLabel(s)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label={'State'} name={'state'}>
            <Select>
              {properties[createForm.country].states.map((val, index) => (
                <Select.Option value={val.abbreviation} key={index}>
                  {val.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={'siteId'} label={'Gage Name'}>
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
  )
}
