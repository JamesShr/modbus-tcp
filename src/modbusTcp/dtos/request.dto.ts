export type ModBusRequest = {
  slaveId: number;
  address: number;
  functionCode: number;
  timeout: number;
  length?: number;
  value?: number[];
};
