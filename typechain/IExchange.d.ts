/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  PayableOverrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface IExchangeInterface extends ethers.utils.Interface {
  functions: {
    "ethToTokenSwap(uint256)": FunctionFragment;
    "ethToTokenTransfer(uint256,address)": FunctionFragment;
    "getTokenAmount(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "ethToTokenSwap",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "ethToTokenTransfer",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenAmount",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "ethToTokenSwap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ethToTokenTransfer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenAmount",
    data: BytesLike
  ): Result;

  events: {};
}

export class IExchange extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: IExchangeInterface;

  functions: {
    ethToTokenSwap(
      _minTokens: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    ethToTokenTransfer(
      _minTokens: BigNumberish,
      _recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getTokenAmount(
      _ethSold: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  ethToTokenSwap(
    _minTokens: BigNumberish,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  ethToTokenTransfer(
    _minTokens: BigNumberish,
    _recipient: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getTokenAmount(
    _ethSold: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    ethToTokenSwap(
      _minTokens: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    ethToTokenTransfer(
      _minTokens: BigNumberish,
      _recipient: string,
      overrides?: CallOverrides
    ): Promise<void>;

    getTokenAmount(
      _ethSold: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    ethToTokenSwap(
      _minTokens: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    ethToTokenTransfer(
      _minTokens: BigNumberish,
      _recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getTokenAmount(
      _ethSold: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ethToTokenSwap(
      _minTokens: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    ethToTokenTransfer(
      _minTokens: BigNumberish,
      _recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getTokenAmount(
      _ethSold: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
