import { Navigation } from '../components/Common/Navigation'
import { Button, Card, Checkbox, Col, Input, Layout, Row, Tabs } from 'antd'
import { useState } from 'react'
import AppProvider from '../components/App/AppProvider'
import { ExportData } from '../types'
import { exportData, importData } from '../controllers'
import { TabPane } from 'rc-tabs'

const { Content } = Layout

type TabKey = '1' | '2'

const Exporter = () => {
  const [selectedTab, setSelectedTab] = useState<TabKey>('1')
  const [userImportData, setUserImportData] = useState<ExportData>()
  const [jsonValid, setJsonValid] = useState(true)

  const handleSubmit = async () => {
    if (selectedTab === '1') {
      try {
        await exportData()
      } catch (e) {
        console.error(e)
      }
    } else {
      if (!userImportData) return
      await importData(userImportData)
    }
  }

  const Actions = () => {
    return (
      <Button type="text" disabled={!jsonValid} onClick={handleSubmit}>
        Submit
      </Button>
    )
  }

  return (
    <AppProvider>
      <Navigation>
        <Layout className="site-layout-background" style={{ padding: '0' }}>
          <Content style={{ padding: '24px', minHeight: 500 }}>
            <Row justify={'center'}>
              <Col span={24} sm={20} md={16} lg={16} xl={10}>
                <Card title={'Export'} actions={[<Actions />]}>
                  <Row>
                    <Col span={24} md={4} lg={4} xl={8}>
                      <Tabs
                        tabPosition={'left'}
                        defaultActiveKey="1"
                        style={{ height: 220 }}
                        onChange={(val) => setSelectedTab(val as TabKey)}
                      >
                        <TabPane tab={'Export'} key={`1`} />
                        <TabPane tab={'Import'} key={`2`} />
                      </Tabs>
                    </Col>
                    <Col span={24} md={20} lg={20} xl={14}>
                      {selectedTab === '1' && (
                        <div style={{ marginBottom: 24 }}>
                          <Checkbox checked disabled>
                            Gages
                          </Checkbox>
                          <Checkbox checked disabled>
                            Alerts
                          </Checkbox>
                          <Checkbox checked disabled>
                            Settings
                          </Checkbox>
                        </div>
                      )}
                      {selectedTab === '2' && (
                        <Input.TextArea
                          rows={9}
                          onChange={async ({ target }) => {
                            try {
                              setUserImportData(JSON.parse(target.value))
                              setJsonValid(true)
                            } catch {
                              setJsonValid(false)
                            }
                          }}
                        />
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Navigation>
    </AppProvider>
  )
}

export default Exporter
