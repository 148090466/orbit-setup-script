/* eslint-disable no-empty */
import { BigNumber, ContractFactory, Signer, Wallet, ethers } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import {
  L1ToL2MessageGasEstimator,
  L1ToL2MessageStatus,
  L1TransactionReceipt,
} from '@arbitrum/sdk'
import { exit } from 'process'
import { getBaseFee } from '@arbitrum/sdk/dist/lib/utils/lib'
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory'

type NamedFactory = ContractFactory & { contractName: string }
const NamedFactoryInstance = (contractJson: {
  abi: any
  bytecode: string
  contractName: string
}): NamedFactory => {
  const factory = new ContractFactory(
    contractJson.abi,
    contractJson.bytecode
  ) as NamedFactory
  factory['contractName'] = contractJson.contractName
  return factory
}

///////////////////
///////////////////
// import from token-bridge-contracts directly to make sure the bytecode is the same
import L1GatewayRouter from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/gateway/L1GatewayRouter.sol/L1GatewayRouter.json'
const L1GatewayRouter__factory = NamedFactoryInstance(L1GatewayRouter)

import L1ERC20Gateway from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/gateway/L1ERC20Gateway.sol/L1ERC20Gateway.json'
const L1ERC20Gateway__factory = NamedFactoryInstance(L1ERC20Gateway)

import L1CustomGateway from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/gateway/L1CustomGateway.sol/L1CustomGateway.json'
const L1CustomGateway__factory = NamedFactoryInstance(L1CustomGateway)
import L1WethGateway from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/gateway/L1WethGateway.sol/L1WethGateway.json'
const L1WethGateway__factory = NamedFactoryInstance(L1WethGateway)
import L2AtomicTokenBridgeFactory from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/L2AtomicTokenBridgeFactory.sol/L2AtomicTokenBridgeFactory.json'
const L2AtomicTokenBridgeFactory__factory = NamedFactoryInstance(
  L2AtomicTokenBridgeFactory
)
import L1TokenBridgeRetryableSender from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/L1TokenBridgeRetryableSender.sol/L1TokenBridgeRetryableSender.json'
const L1TokenBridgeRetryableSender__factory = NamedFactoryInstance(
  L1TokenBridgeRetryableSender
)
import L1OrbitERC20Gateway from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/gateway/L1OrbitERC20Gateway.sol/L1OrbitERC20Gateway.json'
const L1OrbitERC20Gateway__factory = NamedFactoryInstance(L1OrbitERC20Gateway)
import L1OrbitCustomGateway from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/gateway/L1OrbitCustomGateway.sol/L1OrbitCustomGateway.json'
const L1OrbitCustomGateway__factory = NamedFactoryInstance(L1OrbitCustomGateway)
import L1OrbitGatewayRouter from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/gateway/L1OrbitGatewayRouter.sol/L1OrbitGatewayRouter.json'
const L1OrbitGatewayRouter__factory = NamedFactoryInstance(L1OrbitGatewayRouter)

import L2GatewayRouter from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/gateway/L2GatewayRouter.sol/L2GatewayRouter.json'
const L2GatewayRouter__factory = NamedFactoryInstance(L2GatewayRouter)
import L2ERC20Gateway from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/gateway/L2ERC20Gateway.sol/L2ERC20Gateway.json'
const L2ERC20Gateway__factory = NamedFactoryInstance(L2ERC20Gateway)
import L2CustomGateway from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/gateway/L2CustomGateway.sol/L2CustomGateway.json'
import L1AtomicTokenBridgeCreator from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/L1AtomicTokenBridgeCreator.sol/L1AtomicTokenBridgeCreator.json'
const L1AtomicTokenBridgeCreator__factory = NamedFactoryInstance(
  L1AtomicTokenBridgeCreator
)
const L2CustomGateway__factory = NamedFactoryInstance(L2CustomGateway)
import L2WethGateway from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/gateway/L2WethGateway.sol/L2WethGateway.json'
const L2WethGateway__factory = NamedFactoryInstance(L2WethGateway)
import AeWETH from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/libraries/aeWETH.sol/aeWETH.json'
const AeWETH__factory = NamedFactoryInstance(AeWETH)
import ArbMulticall2 from '@arbitrum/token-bridge-contracts/build/contracts/contracts/rpc-utils/MulticallV2.sol/ArbMulticall2.json'

// import from nitro-contracts directly to make sure the bytecode is the same
import IInbox from '@arbitrum/nitro-contracts/build/contracts/src/bridge/IInbox.sol/IInbox.json'
const IInbox__factory = NamedFactoryInstance(IInbox)
import IERC20Bridge from '@arbitrum/nitro-contracts/build/contracts/src/bridge/IERC20Bridge.sol/IERC20Bridge.json'
const IERC20Bridge__factory = NamedFactoryInstance(IERC20Bridge)
import TransparentUpgradeableProxy from '@arbitrum/nitro-contracts/build/contracts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json'
const TransparentUpgradeableProxy__factory = NamedFactoryInstance(
  TransparentUpgradeableProxy
)
import UpgradeExecutor from '@arbitrum/nitro-contracts/build/contracts/src/mocks/UpgradeExecutorMock.sol/UpgradeExecutorMock.json'
const UpgradeExecutor__factory = NamedFactoryInstance(UpgradeExecutor)
import ProxyAdmin from '@arbitrum/nitro-contracts/build/contracts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json'
const ProxyAdmin__factory = NamedFactoryInstance(ProxyAdmin)
import IERC20 from '@arbitrum/nitro-contracts/build/contracts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json'
const IERC20__factory = NamedFactoryInstance(IERC20)

///////////////////
///////////////////
/**
 * Use already deployed L1TokenBridgeCreator to create and init token bridge contracts.
 * Function first gets estimates for 2 retryable tickets - one for deploying L2 factory and
 * one for deploying L2 side of token bridge. Then it creates retryables, waits for
 * until they're executed, and finally it picks up addresses of new contracts.
 *
 * @param l1Signer
 * @param l2Provider
 * @param l1TokenBridgeCreator
 * @param rollupAddress
 * @returns
 */
export const createTokenBridge = async (
  l1Signer: Signer,
  l2Provider: ethers.providers.Provider,
  l1TokenBridgeCreator: ethers.Contract,
  rollupAddress: string,
  childChainId: number
) => {
  const gasPrice = await l2Provider.getGasPrice()
  //// run retryable estimate for deploying L2 factory
  const deployFactoryGasParams = await getEstimateForDeployingFactory(
    l1Signer,
    l2Provider
  )
  const maxGasForFactory =
    await l1TokenBridgeCreator.gasLimitForL2FactoryDeployment()
  const maxSubmissionCostForFactory = deployFactoryGasParams.maxSubmissionCost
  //// run retryable estimate for deploying L2 contracts
  //// we do this estimate using L2 factory template on L1 because on L2 factory does not yet exist
  const l2FactoryTemplate = L2AtomicTokenBridgeFactory__factory.attach(
    await l1TokenBridgeCreator.l2TokenBridgeFactoryTemplate()
  ).connect(l1Signer)
  const l2Code = {
    router: L2GatewayRouter.bytecode,
    standardGateway: L2ERC20Gateway.bytecode,
    customGateway: L2CustomGateway.bytecode,
    wethGateway: L2WethGateway.bytecode,
    aeWeth: AeWETH.bytecode,
    upgradeExecutor: UpgradeExecutor.bytecode,
    multicall: ArbMulticall2.bytecode,
  }
  const gasEstimateToDeployContracts =
    await l2FactoryTemplate.estimateGas.deployL2Contracts(
      l2Code,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address
    )
  const maxGasForContracts = gasEstimateToDeployContracts.mul(2)
  const maxSubmissionCostForContracts =
    deployFactoryGasParams.maxSubmissionCost.mul(2)
  let retryableFee = maxSubmissionCostForFactory
    .add(maxSubmissionCostForContracts)
    .add(maxGasForFactory.mul(gasPrice))
    .add(maxGasForContracts.mul(gasPrice))

  // get inbox from rollup contract
  const inbox = await RollupAdminLogic__factory.connect(
    rollupAddress,
    l1Signer.provider!
  ).inbox()
  // if fee token is used approve the fee
  const feeToken = await _getFeeToken(inbox, l1Signer.provider!)
  if (feeToken != ethers.constants.AddressZero) {
    await (
      await IERC20__factory.attach(feeToken)
        .connect(l1Signer)
        .attach(feeToken)
        .approve(l1TokenBridgeCreator.address, retryableFee)
    ).wait()
    retryableFee = BigNumber.from(0)
  }
  /// do it - create token bridge
  const receipt = await (
    await l1TokenBridgeCreator.createTokenBridge(
      inbox,
      await l1Signer.getAddress(),
      maxGasForContracts,
      gasPrice,
      { value: retryableFee }
    )
  ).wait()
  console.log('Deployment TX:', receipt.transactionHash)

  /// wait for execution of both tickets
  const l1TxReceipt = new L1TransactionReceipt(receipt)
  const messages = await l1TxReceipt.getL1ToL2Messages(l2Provider)
  const messageResults = await Promise.all(
    messages.map(message => message.waitForStatus())
  )

  // if both tickets are not redeemed log it and exit
  if (
    messageResults[0].status !== L1ToL2MessageStatus.REDEEMED ||
    messageResults[1].status !== L1ToL2MessageStatus.REDEEMED
  ) {
    console.log(
      `Retryable ticket (ID ${messages[0].retryableCreationId}) status: ${
        L1ToL2MessageStatus[messageResults[0].status]
      }`
    )
    console.log(
      `Retryable ticket (ID ${messages[1].retryableCreationId}) status: ${
        L1ToL2MessageStatus[messageResults[1].status]
      }`
    )
    exit()
  }

  /// pick up L2 factory address from 1st ticket
  const l2AtomicTokenBridgeFactory = L2AtomicTokenBridgeFactory__factory.attach(
    messageResults[0].l2TxReceipt.contractAddress
  ).connect(l2Provider)
  console.log('L2AtomicTokenBridgeFactory', l2AtomicTokenBridgeFactory.address)

  /// pick up L1 contracts from events
  const {
    router: l1Router,
    standardGateway: l1StandardGateway,
    customGateway: l1CustomGateway,
    wethGateway: l1WethGateway,
    proxyAdmin: l1ProxyAdmin,
  } = getParsedLogs(
    receipt.logs,
    l1TokenBridgeCreator.interface,
    'OrbitTokenBridgeCreated'
  )[0].args

  /// pick up L2 contracts
  const l2Router = await l1TokenBridgeCreator.getCanonicalL2RouterAddress(
    childChainId
  )
  const l2StandardGateway = L2ERC20Gateway__factory.attach(
    await l1TokenBridgeCreator.getCanonicalL2StandardGatewayAddress(
      childChainId
    )
  ).connect(l2Provider)
  const beaconProxyFactory = await l2StandardGateway.beaconProxyFactory()
  const l2CustomGateway =
    await l1TokenBridgeCreator.getCanonicalL2CustomGatewayAddress(childChainId)

  const isUsingFeeToken = feeToken != ethers.constants.AddressZero
  const l2WethGateway = isUsingFeeToken
    ? ethers.constants.AddressZero
    : L2WethGateway__factory.attach(
        await l1TokenBridgeCreator.getCanonicalL2WethGatewayAddress(
          childChainId
        )
      ).connect(l2Provider).address
  const l1Weth = await l1TokenBridgeCreator.l1Weth()
  const l2Weth = isUsingFeeToken
    ? ethers.constants.AddressZero
    : await l1TokenBridgeCreator.getCanonicalL2WethAddress(childChainId)
  const l2ProxyAdmin =
    await l1TokenBridgeCreator.getCanonicalL2ProxyAdminAddress(childChainId)

  return {
    l1Router,
    l1StandardGateway,
    l1CustomGateway,
    l1WethGateway,
    l1ProxyAdmin,
    l2Router,
    l2StandardGateway: l2StandardGateway.address,
    l2CustomGateway,
    l2WethGateway,
    l1Weth,
    l2Weth,
    beaconProxyFactory,
    l2ProxyAdmin,
  }
}

/**
 * Deploy token bridge creator contract to base chain and set all the templates
 * @param l1Deployer
 * @param l2Provider
 * @param l1WethAddress
 * @returns
 */
export const deployL1TokenBridgeCreator = async (
  l1Deployer: Signer,
  l2Provider: ethers.providers.Provider,
  l1WethAddress: string
) => {
  /// deploy creator behind proxy
  const l1TokenBridgeCreatorProxyAdmin = await ProxyAdmin__factory.deploy()
  await l1TokenBridgeCreatorProxyAdmin.deployed()

  const l1TokenBridgeCreatorLogic =
    await L1AtomicTokenBridgeCreator__factory.deploy()
  await l1TokenBridgeCreatorLogic.deployed()

  const l1TokenBridgeCreatorProxy =
    await TransparentUpgradeableProxy__factory.deploy(
      l1TokenBridgeCreatorLogic.address,
      l1TokenBridgeCreatorProxyAdmin.address,
      '0x'
    )
  await l1TokenBridgeCreatorProxy.deployed()

  const l1TokenBridgeCreator = L1AtomicTokenBridgeCreator__factory.attach(
    l1TokenBridgeCreatorProxy.address
  ).connect(l1Deployer)

  /// deploy retryable sender behind proxy
  const retryableSenderLogic =
    await L1TokenBridgeRetryableSender__factory.deploy()
  await retryableSenderLogic.deployed()

  const retryableSenderProxy =
    await TransparentUpgradeableProxy__factory.deploy(
      retryableSenderLogic.address,
      l1TokenBridgeCreatorProxyAdmin.address,
      '0x'
    )
  await retryableSenderProxy.deployed()

  const retryableSender = L1TokenBridgeRetryableSender__factory.attach(
    retryableSenderProxy.address
  ).connect(l1Deployer)

  /// init creator
  await (await l1TokenBridgeCreator.initialize(retryableSender.address)).wait()

  /// deploy L1 logic contracts
  const routerTemplate = await L1GatewayRouter__factory.deploy()
  await routerTemplate.deployed()

  const standardGatewayTemplate = await L1ERC20Gateway__factory.deploy()
  await standardGatewayTemplate.deployed()

  const customGatewayTemplate = await L1CustomGateway__factory.deploy()
  await customGatewayTemplate.deployed()

  const wethGatewayTemplate = await L1WethGateway__factory.deploy()
  await wethGatewayTemplate.deployed()

  const feeTokenBasedRouterTemplate =
    await L1OrbitGatewayRouter__factory.deploy()
  await feeTokenBasedRouterTemplate.deployed()

  const feeTokenBasedStandardGatewayTemplate =
    await L1OrbitERC20Gateway__factory.deploy()
  await feeTokenBasedStandardGatewayTemplate.deployed()

  const feeTokenBasedCustomGatewayTemplate =
    await L1OrbitCustomGateway__factory.deploy()
  await feeTokenBasedCustomGatewayTemplate.deployed()

  const upgradeExecutor = await UpgradeExecutor__factory.deploy()
  await upgradeExecutor.deployed()

  const l1Templates = {
    routerTemplate: routerTemplate.address,
    standardGatewayTemplate: standardGatewayTemplate.address,
    customGatewayTemplate: customGatewayTemplate.address,
    wethGatewayTemplate: wethGatewayTemplate.address,
    feeTokenBasedRouterTemplate: feeTokenBasedRouterTemplate.address,
    feeTokenBasedStandardGatewayTemplate:
      feeTokenBasedStandardGatewayTemplate.address,
    feeTokenBasedCustomGatewayTemplate:
      feeTokenBasedCustomGatewayTemplate.address,
    upgradeExecutor: upgradeExecutor.address,
  }

  /// deploy L2 contracts as placeholders on L1

  const l2TokenBridgeFactoryOnL1 =
    await L2AtomicTokenBridgeFactory__factory.deploy()
  await l2TokenBridgeFactoryOnL1.deployed()

  const l2GatewayRouterOnL1 = await L2GatewayRouter__factory.deploy()
  await l2GatewayRouterOnL1.deployed()

  const l2StandardGatewayAddressOnL1 = await L2ERC20Gateway__factory.deploy()
  await l2StandardGatewayAddressOnL1.deployed()

  const l2CustomGatewayAddressOnL1 = await L2CustomGateway__factory.deploy()
  await l2CustomGatewayAddressOnL1.deployed()

  const l2WethGatewayAddressOnL1 = await L2WethGateway__factory.deploy()
  await l2WethGatewayAddressOnL1.deployed()

  const l2WethAddressOnL1 = await AeWETH__factory.deploy()
  await l2WethAddressOnL1.deployed()

  //// run retryable estimate for deploying L2 factory
  const deployFactoryGasParams = await getEstimateForDeployingFactory(
    l1Deployer,
    l2Provider
  )

  await (
    await l1TokenBridgeCreator.setTemplates(
      l1Templates,
      l2TokenBridgeFactoryOnL1.address,
      l2GatewayRouterOnL1.address,
      l2StandardGatewayAddressOnL1.address,
      l2CustomGatewayAddressOnL1.address,
      l2WethGatewayAddressOnL1.address,
      l2WethAddressOnL1.address,
      l1WethAddress,
      deployFactoryGasParams.gasLimit
    )
  ).wait()

  return l1TokenBridgeCreator
}

export const getEstimateForDeployingFactory = async (
  l1Deployer: Signer,
  l2Provider: ethers.providers.Provider
) => {
  //// run retryable estimate for deploying L2 factory
  const l1DeployerAddress = await l1Deployer.getAddress()
  const l1ToL2MsgGasEstimate = new L1ToL2MessageGasEstimator(l2Provider)
  const deployFactoryGasParams = await l1ToL2MsgGasEstimate.estimateAll(
    {
      from: ethers.Wallet.createRandom().address,
      to: ethers.constants.AddressZero,
      l2CallValue: BigNumber.from(0),
      excessFeeRefundAddress: l1DeployerAddress,
      callValueRefundAddress: l1DeployerAddress,
      data: L2AtomicTokenBridgeFactory__factory.bytecode,
    },
    await getBaseFee(l1Deployer.provider!),
    l1Deployer.provider!
  )

  return deployFactoryGasParams
}

export const getSigner = (provider: JsonRpcProvider, key?: string) => {
  if (!key && !provider)
    throw new Error('Provide at least one of key or provider.')
  if (key) return new Wallet(key).connect(provider)
  else return provider.getSigner(0)
}

export const getParsedLogs = (
  logs: ethers.providers.Log[],
  iface: ethers.utils.Interface,
  eventName: string
) => {
  const eventFragment = iface.getEvent(eventName)
  const parsedLogs = logs
    .filter(
      (curr: any) => curr.topics[0] === iface.getEventTopic(eventFragment)
    )
    .map((curr: any) => iface.parseLog(curr))
  return parsedLogs
}

const _getFeeToken = async (
  inbox: string,
  l1Provider: ethers.providers.Provider
) => {
  const bridge = await IInbox__factory.attach(inbox)
    .connect(l1Provider)
    .bridge()

  let feeToken = ethers.constants.AddressZero

  try {
    feeToken = await IERC20Bridge__factory.attach(bridge)
      .connect(l1Provider)
      .nativeToken()
  } catch {}

  return feeToken
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
