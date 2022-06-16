import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import './styles.css';
import { abi } from '../utils/contract.json';
import { WaveDto } from '../dtos/wave.dto';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractABI = abi;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [currentContract, setCurrentContract] = useState<any>(null);
  const [waves, setWaves] = useState<WaveDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { ethereum } = window;

  const getData = async () => {
    try {
      const response = await currentContract.getWaves();

      const data: WaveDto[] = response.map((wave: any) => ({
        message: wave.message,
        sender: wave.sender,
        timestamp: new Date(wave.timestamp * 1000),
      }));

      setWaves(data);
    } catch (error) {
      console.log(error);

      alert('Não foi possível listar as mensagens recebidas');
    }
  };

  const checkWallet = async () => {
    try {
      if (!ethereum) {
        alert('Instale a extensão MetaMask para continuar!');

        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const [account] = accounts;

        setCurrentAccount(account);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);

      if (!ethereum) {
        alert('Instale a extensão MetaMask para continuar!');

        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      const [account] = accounts;

      setCurrentAccount(account);
    } catch (error) {
      console.log(error);

      alert('Não foi possível conectar a carteira');
    } finally {
      setLoading(false);
    }
  };

  const sendWave = async () => {
    try {
      setLoading(true);

      const waveTxn = await currentContract.wave(message, {
        gasLimit: 300000,
      });

      setMessage('');

      await waveTxn.wait();
    } catch (error) {
      console.log(error);

      alert('Não foi possível enviar a sua mensagem!');
    } finally {
      setLoading(false);
    }
  };

  const onWaveCreated = (
    sender: string,
    timestamp: number,
    message: string,
  ) => {
    const newWave: WaveDto = {
      sender,
      timestamp: new Date(timestamp * 1000),
      message,
    };

    setWaves(prevState => {
      return [newWave, ...prevState];
    });
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  useEffect(() => {
    checkWallet();
  }, []);

  useEffect(() => {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );

      setCurrentContract(contract);
    }
  }, []);

  useEffect(() => {
    if (currentAccount && currentContract) {
      getData();

      currentContract.on('waveCreated', onWaveCreated);
    }

    return () => {
      if (currentContract) {
        currentContract.off('waveCreated', onWaveCreated);
      }
    };
  }, [currentAccount, currentContract]);

  return (
    <div className='mainContainer'>
      <div className='dataContainer'>
        <div className='header'>👋 Olá Pessoal!</div>
        <div className='bio'>
          Eu sou o Tarcísio e trabalho com desenvolvimento web e mobila já há
          alguns anos, sabia? Legal, né? Conecte sua carteira Ethereum wallet e
          me manda um tchauzinho!
        </div>
        <br />
        <input
          placeholder='Insira sua mensagem'
          type='text'
          value={message}
          onChange={onInputChange}
        />

        <button className='waveButton' disabled={loading} onClick={sendWave}>
          Mandar Tchauzinho 🌟
        </button>
        {!currentAccount && (
          <button
            className='waveButton'
            disabled={loading}
            onClick={connectWallet}
          >
            Conectar carteira
          </button>
        )}
        {waves.map((wave, index) => {
          return (
            <div key={index} className='waveCard'>
              <div>Endereço: {wave.sender}</div>
              <div>Data/Horário: {wave.timestamp.toString()}</div>
              <div>Mensagem: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
