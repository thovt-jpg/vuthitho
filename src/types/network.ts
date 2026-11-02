export type ServiceType = 'web' | 'mail' | 'ftp' | 'dns' | 'router' | 'switch' | 'client' | 'server';

export type GrayTone = 'slate-gray' | 'cool-gray' | 'light-gray';

export interface PortForwardRule {
  id: string;
  service: 'Web' | 'Mail' | 'FTP' | 'Management';
  subService: string;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  externalPort: string;
  internalIp: string;
  internalPort: string;
  description: string;
  securityNote: string;
  isRequired: boolean;
}

export interface DnsRecord {
  type: 'A' | 'CNAME' | 'MX' | 'TXT' | 'PTR' | 'NS';
  host: string;
  value: string;
  ttl: number;
  priority?: number;
  purpose: string;
}

export interface NetworkConfig {
  domain: string;
  publicIp: string;
  publicGateway: string;
  lanSubnet: string;
  lanGateway: string;
  serverLanIp: string;
  serverHostname: string;
  ftpPassiveRange: string;
}

export type PacketStepState = 'client' | 'internet' | 'dns' | 'router_wan' | 'nat_translation' | 'switch' | 'server' | 'server_response' | 'router_snat' | 'completed';

export interface SimulationScenario {
  id: string;
  title: string;
  service: 'web' | 'mail' | 'ftp' | 'lan';
  clientIp: string;
  clientType: 'external_browser' | 'external_mail_mta' | 'external_ftp_client' | 'internal_office_pc';
  description: string;
  protocol: string;
  targetPort: number;
  targetDomain: string;
  steps: {
    state: PacketStepState;
    title: string;
    description: string;
    srcIp: string;
    srcPort: number;
    dstIp: string;
    dstPort: number;
    natAction?: string;
    packetDetails: string;
  }[];
}
