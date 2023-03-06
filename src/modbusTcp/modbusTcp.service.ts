import { Logger } from '@nestjs/common';
import { ConnectOptions } from './dtos/connect.dto';
import { ModBusRequest } from './dtos/request.dto';
import ModbusRTU from 'modbus-serial';

export class ModbusTcpService {
  private client: ModbusRTU;
  private connectOption: ConnectOptions;
  constructor(connectOption: ConnectOptions) {
    this.client = new ModbusRTU();
    this.connectOption = Object.assign({}, { ...connectOption });
  }

  connect() {
    try {
      switch (this.connectOption.type) {
        case 'tcp':
          this.client
            .connectTCP(this.connectOption.ip, { port: this.connectOption.port })
            .then(() => {
              Logger.log(
                `connect tcp ${this.connectOption.ip}:${this.connectOption.port} success`,
              );
            })
            .catch((error) => {
              Logger.error(
                `client ${this.connectOption.ip}:${this.connectOption.port} tcp connect failed ${error.errno}`,
              );
            });
          break;
        case 'telnet':
          this.client
            .connectTelnet(this.connectOption.ip, {
              port: this.connectOption.port,
            })
            .then(() => {
              Logger.log(
                `connect telnet ${this.connectOption.ip}:${this.connectOption.port} success`,
              );
            })
            .catch((error) => {
              Logger.error(
                `client ${this.connectOption.ip}:${this.connectOption.port} telnet connect failed ${error.errno}`,
              );
            });
          break;
        default:
          break;
      }
    } catch (error) {
      return error
    }
    
  }

  disconnect() {
    this.client['_port']['_client'].destroy()
        
    Logger.log(
      `client ${this.connectOption.ip}:${this.connectOption.port} disconnected`,
    );
  }

  async request(modbusRequest: ModBusRequest): Promise<number[] | Error> {
    this.client.setID(modbusRequest.slaveId);
      this.client.setTimeout(modbusRequest.timeout);
      switch (modbusRequest.functionCode) {
        case 3:
          return (
            await this.client.readHoldingRegisters(
              modbusRequest.address,
              modbusRequest.length,
            )
          ).data;
        case 4:
          return (
            await this.client.readInputRegisters(
              modbusRequest.address,
              modbusRequest.length,
            )
          ).data;
        case 6:
          await this.client.writeRegister(
            modbusRequest.address,
            modbusRequest.value[0] || 0,
          );
          return modbusRequest.value;
        case 16:
          await this.client.writeRegisters(
            modbusRequest.address,
            modbusRequest.value,
          );
          return modbusRequest.value;
      }
  }
}
