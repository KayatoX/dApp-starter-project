// App.js
import React, { useEffect, useState } from "react";
import "./App.css";
// ethers のさまざまなクラスや関数は、ethersproject が提供するサブパッケージからインポート
import { ethers } from "ethers";
// API ファイルを含むWavePortal.jsonファイルをインポート
import abi from "./utils/WavePortal.json";

const App = () => {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数を定義します */
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount: ", currentAccount);
  // デプロイされたコントラクトアドレスを保持する変数を作成
  const contractAddress = "0x9583C72D95dbC8D2bf14E2b1C8c0247fEe67ffFE";
  // APIの内容を参照する変数を作成
  const contractABI = abi.abi;

  /* window.ethereumにアクセスできることを確認します */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /* ユーザーのウォレットへのアクセスが許可されているかどうかを確認します */
      // eth_accountsは空の配列または単一のアカウントアドレスを含む配列を返す特別なメソッド
      // accountsにWEBサイトを訪れたユーザーのウォレットアカウントを格納する（複数持っている場合も加味、よって account's' と変数を定義している）
      const accounts = await ethereum.request({ method: "eth_accounts" });
      // もしアカウントが一つでも存在したら、以下を実行。
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        // currentAccountにユーザーのアカウントアドレスを格納
        setCurrentAccount(account);
      } else {
        // アカウントが存在しない場合は、エラーを出力。
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  // connectWalletメソッドを実装
  const connectWallet = async () => {
    // ユーザーが認証可能なウォレットアドレスを持っているか確認
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      // 持っている場合は、ユーザーに対してウォレットへのアクセス許可を求める。許可されれば、ユーザーの最初のウォレットアドレスを currentAccount に格納する。
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  // waveの回数をカウントする関数を実装
  const wave = async () => {
    try {
      // ユーザーのMetaMaskの有無の確認
      const { ethereum } = window;
      if (ethereum) {
        // ① プロバイダー
        // プロバイダー = MetaMaskとして設定
        // プロバイダーを介してイーサリアムノードに接続する
        // ehhersのライブラリからprovidorのインスタンスを新規生成
        const provider = new ethers.providers.Web3Provider(ethereum);
        // ② signer
        // signer はユーザーのウォレットアドレスを抽象化したもの
        // provider を作成しprovider.getSignerでユーザーはウォレットからトランザクションを署名できる
        // getSignerは新しいsignerインスタンスを返すのでそれを使って署名付きトランザクションを送信する
        const signer = provider.getSigner();
        // ③ コントラクトインスタンス
        // コントラクトへ接続している。ここでは3つの変数が必要
        // 1. コントラクトのデプロイ先のアドレス
        // 2. コントラクトのABI
        // 3. provider もしくはsigner
          // コントラクトインスタンスではコントラクトに格納されているすべてのコントラクトを呼び出せる
          // このコントラクトインスタンスにproviderを渡すと、そのインスタンスは読み取り専用の機能しか実行できなくなる
          // signerを渡すと読み書き両方できる。
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        console.log("Signer:", signer);
        // コントラクトにwaveを書き込む
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  /* WEBページがロードされたときに下記の関数を実行します */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="hand-wave">
            👋
          </span>{" "}
          WELCOME!
        </div>
        <div className="bio">
          イーサリアムウォレットを接続して、「
          <span role="img" aria-label="hand-wave">
            👋
          </span>
          (wave)」を送ってください
          <span role="img" aria-label="shine">
            ✨
          </span>
        </div>
        <button className="waveButton" onClick={wave}>Wave at Me</button>
        {/* ウォレットコネクトのボタンを実装 */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Wallet Connected
          </button>
        )}
      </div>
    </div>
  );
};
export default App;