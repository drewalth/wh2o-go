import React, { useState, useEffect } from 'react'
import { Select } from 'antd'
import { GageReading, GageMetric } from '../../types'

type ReadingSelectProps = {
  readings: GageReading[]
}

export const ReadingSelect = ({
  readings
}: ReadingSelectProps): JSX.Element => {
  const [activeMetric, setAcitveMetric] = useState<GageMetric>(GageMetric.CFS)
  const [reading, setReading] = useState<number>()
  const metrics = Array.from(new Set(readings?.map(r => r.Metric)))
  useEffect(() => {
    const val = readings?.filter(r => r.Metric === activeMetric)[0]?.Value

    setReading(val)
  }, [activeMetric, readings])

  const renderReading = () => {
    if (activeMetric === GageMetric.TEMP) {
      return (
        <span>
          {reading}
          &nbsp;&deg;C
        </span>
      )
    }

    if (reading === -999999) {
      return 'Disabled'
    }

    return reading
  }

  if (readings.length === 0) {
    return <>-</>
  }

  return (
    <div>
      {renderReading()}
      {metrics.length > 0 && reading !== -999999 && (
        <Select
          defaultValue={'CFS'}
          bordered={false}
          size={'small'}
          onSelect={(val: string) => setAcitveMetric(val as GageMetric)}
        >
          {metrics.map((m, index) => (
            <Select.Option key={m + index} value={m}>
              {m}
            </Select.Option>
          ))}
        </Select>
      )}
    </div>
  )
}
