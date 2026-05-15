import * as mqtt from 'aws-iot-device-sdk-v2';
import path from 'path';

/**
 * AWS IoT Core Client Implementation
 * This service handles the real-time MQTT connection to AWS IoT Core.
 */
export class AwsIotClient {
  private connection: mqtt.mqtt.MqttClientConnection | null = null;
  private endpoint: string;
  private clientId: string;

  constructor(endpoint: string, clientId: string = 'pollution-monitor-client') {
    this.endpoint = endpoint;
    this.clientId = clientId;
  }

  /**
   * Connect to AWS IoT Core using mTLS certificates
   */
  async connect() {
    try {
      const certPath = path.resolve(process.cwd(), 'certs/device.pem.crt');
      const keyPath = path.resolve(process.cwd(), 'certs/private.pem.key');
      const caPath = path.resolve(process.cwd(), 'certs/AmazonRootCA1.pem');

      const config = mqtt.iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(certPath, keyPath)
        .with_certificate_authority_from_path(undefined, caPath)
        .with_client_id(this.clientId)
        .with_endpoint(this.endpoint)
        .build();

      const client = new mqtt.mqtt.MqttClient();
      this.connection = client.new_connection(config);

      console.log('Connecting to AWS IoT Core...');
      await this.connection.connect();
      console.log('Connected to AWS IoT Core successfully!');
      
      return true;
    } catch (error) {
      console.error('Failed to connect to AWS IoT Core:', error);
      throw error;
    }
  }

  /**
   * Publish sensor data to a specific topic
   */
  async publishData(topic: string, data: any) {
    if (!this.connection) {
      throw new Error('MQTT Connection not initialized. Call connect() first.');
    }

    try {
      const payload = JSON.stringify(data);
      await this.connection.publish(topic, payload, mqtt.mqtt.QoS.AtLeastOnce);
      console.log(`Published to ${topic}:`, data.deviceId);
    } catch (error) {
      console.error('Error publishing data to AWS IoT Core:', error);
    }
  }

  /**
   * Close the connection
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.disconnect();
      this.connection = null;
      console.log('Disconnected from AWS IoT Core.');
    }
  }
}
