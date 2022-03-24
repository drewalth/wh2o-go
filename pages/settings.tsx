import { Navigation } from '../components/Common/Navigation';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  Row,
  Select,
  Tabs,
} from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import AppProvider from '../components/App/AppProvider';
import { AlertChannel, RequestStatus, UserConfigDto } from '../types';
import { getSettings, updateSettings } from '../controllers';
import debounce from 'lodash.debounce';
import timezones from '../lib/timezones';
import { TabPane } from 'rc-tabs';

const { Content } = Layout;

type Tabs = '1' | '2';

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState<Tabs>('1');
  const [userConfig, setUserConfig] = useState<UserConfigDto>({
    mailgunKey: '',
    mailgunDomain: '',
    emailAddress: '',
    twilioAccountSID: '',
    twilioAuthToken: '',
    twilioMessagingServiceSid: '',
    twilioSMSTelephoneNumberFrom: '',
    twilioSMSTelephoneNumberTo: '',
    timezone: 'America/Denver',
  });
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('loading');

  const handleValueChange = debounce(async (val: any) => {
    try {
      const payload = Object.assign({}, userConfig, val);
      setUserConfig(payload);
      await updateSettings(payload);
    } catch (e) {
      console.error(e);
    }
  }, 250);

  useEffect(() => {
    (async () => {
      try {
        setRequestStatus('loading');
        const settings = await getSettings();
        setUserConfig(settings);
        setRequestStatus('success');
      } catch (e) {
        setRequestStatus('failure');
      }
    })();
  }, []);

  const navToDocumentation = (site: AlertChannel) => {
    if (site === 'email') {
      window.open('https://www.mailgun.com/', '_blank');
    }

    if (site === 'sms') {
      window.open('https://www.twilio.com/docs/sms', '_blank');
    }
  };

  const getCardActions = () => {
    if (selectedTab === '1') {
      return [
        <Button
          onClick={() => navToDocumentation(AlertChannel.EMAIL)}
          type={'text'}
          icon={<MailOutlined />}
          key={'mailgun'}
        >
          Mailgun Docs
        </Button>,
      ];
    }

    return [
      <Button
        onClick={() => navToDocumentation(AlertChannel.SMS)}
        type={'text'}
        icon={<PhoneOutlined />}
        key={'twilio'}
      >
        Twilio Docs
      </Button>,
    ];
  };

  return (
    <AppProvider>
      <Navigation>
        <Layout className="site-layout-background" style={{ padding: '0' }}>
          <Content style={{ padding: '24px', minHeight: 500 }}>
            <Row justify={'center'}>
              <Col span={24} sm={20} md={16} lg={16} xl={10}>
                <Card
                  loading={requestStatus === 'loading'}
                  title={'Settings'}
                  actions={getCardActions()}
                >
                  {requestStatus === 'success' && (
                    <Row>
                      <Col span={24} md={4} lg={4} xl={8}>
                        <Tabs
                          tabPosition={'left'}
                          defaultActiveKey="1"
                          style={{ height: 220 }}
                          onChange={(val) => {
                            {
                              /* @ts-ignore */
                            }
                            setSelectedTab(val as Tabs);
                          }}
                        >
                          <TabPane tab={'Email'} key={`1`} />
                          <TabPane tab={'SMS'} key={`2`} />
                        </Tabs>
                      </Col>
                      <Col span={24} md={20} lg={20} xl={14}>
                        <Form
                          initialValues={userConfig}
                          onValuesChange={handleValueChange}
                          layout={'vertical'}
                        >
                          <Form.Item
                            name={'emailAddress'}
                            label={'Email'}
                            hidden={selectedTab !== '1'}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name={'timezone'}
                            label={'Timezone'}
                            hidden={selectedTab !== '1'}
                          >
                            <Select>
                              {timezones.map((tz) => (
                                <Select.Option value={tz} key={tz}>
                                  {tz}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            name={'mailgunKey'}
                            label={'Mailgun API Key'}
                            hidden={selectedTab !== '1'}
                          >
                            <Input.Password />
                          </Form.Item>
                          <Form.Item
                            name={'twilioAccountSID'}
                            label={'Twilio Account SID'}
                            hidden={selectedTab !== '2'}
                          >
                            <Input.Password />
                          </Form.Item>
                          <Form.Item
                            name={'twilioAuthToken'}
                            label={'Twilio Auth Token'}
                            hidden={selectedTab !== '2'}
                          >
                            <Input.Password />
                          </Form.Item>
                          <Form.Item
                            name={'twilioMessagingServiceSid'}
                            label={'Twilio Messaging Service SID'}
                            hidden={selectedTab !== '2'}
                          >
                            <Input.Password />
                          </Form.Item>
                          <Form.Item
                            name={'twilioSMSTelephoneNumberTo'}
                            label={'Twilio SMS Telephone No. To'}
                            hidden={selectedTab !== '2'}
                          >
                            <Input.Password />
                          </Form.Item>
                          <Form.Item
                            name={'twilioSMSTelephoneNumberFrom'}
                            label={'Twilio SMS Telephone No. From'}
                            hidden={selectedTab !== '2'}
                          >
                            <Input.Password />
                          </Form.Item>

                          <Form.Item
                            name={'mailgunDomain'}
                            label={'Mailgun Domain'}
                            hidden={selectedTab !== '1'}
                          >
                            <Input.Password />
                          </Form.Item>
                        </Form>
                      </Col>
                    </Row>
                  )}
                </Card>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Navigation>
    </AppProvider>
  );
};

export default Settings;
