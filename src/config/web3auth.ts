import { Web3Auth } from '@web3auth/modal';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { MetamaskAdapter } from '@web3auth/metamask-adapter';
import { WalletConnectV2Adapter } from '@web3auth/wallet-connect-v2-adapter';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: '0x1', // Ethereum Mainnet
      rpcTarget: 'https://rpc.ankr.com/eth',
      displayName: 'Ethereum Mainnet',
      blockExplorerUrl: 'https://etherscan.io',
      ticker: 'ETH',
      tickerName: 'Ethereum',
    },
  },
});

const web3AuthConfig = {
  clientId: 'BA3AEL6fuwvvonARwjQ5NiYyrEdUTF2tU4nTJoaSd71QP5stPjmkuQjQQ_HnqK1lyxcsfLddbhVfQbS-w8CVAHk',
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
  uiConfig: {
    appName: 'ZIGMA',
    appUrl: 'https://zigma.pro',
    logoLight: '/logonobg.jpeg',
    logoDark: '/logonobg.jpeg',
    defaultLanguage: 'en',
    mode: 'auto',
    theme: {
      primary: '#10b981',
    },
  },
};

export const initializeWeb3Auth = async (): Promise<Web3Auth> => {
  const web3auth = new Web3Auth(web3AuthConfig);

  // Add adapters
  const metamaskAdapter = new MetamaskAdapter({
    clientId: web3AuthConfig.clientId,
    sessionTime: 3600 * 24 * 7, // 7 days
    web3AuthNetwork: web3AuthConfig.web3AuthNetwork,
    chainConfig: web3AuthConfig.privateKeyProvider.config.chainConfig,
  });

  const walletConnectV2Adapter = new WalletConnectV2Adapter({
    adapterSettings: {
      qrcodeModal: {},
      projectId: process.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
    },
    loginSettings: {
      mfaLevel: 'optional',
    },
    privateKeyProvider,
  });

  web3auth.configureAdapter(metamaskAdapter);
  web3auth.configureAdapter(walletConnectV2Adapter);

  await web3auth.initModal({
    modalConfig: {
      [Web3AuthAdapter.TORUS_EVM]: {
        label: 'torus_evm',
        showOnModal: false,
      },
      [Web3AuthAdapter.METAMASK]: {
        label: 'metamask',
        showOnDesktop: true,
        showOnMobile: false,
      },
      [Web3AuthAdapter.WALLET_CONNECT_V2]: {
        label: 'wallet_connect_v2',
        showOnDesktop: true,
        showOnMobile: true,
      },
    },
  });

  return web3auth;
};

export { web3AuthConfig };
