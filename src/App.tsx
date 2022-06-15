import { ethers } from 'ethers';
import './App.css';

function App() {
  const wave = () => {};

  return (
    <div className='mainContainer'>
      <div className='dataContainer'>
        <div className='header'>👋 Olá Pessoal!</div>
        <div className='bio'>
          Eu sou o Tarcísio e trabalho com desenvolvimento web e mobila já há
          alguns anos, sabia? Legal, né? Conecte sua carteira Ethereum wallet e
          me manda um tchauzinho!
        </div>
        <button className='waveButton' onClick={wave}>
          Mandar Tchauzinho 🌟
        </button>
      </div>
    </div>
  );
}

export default App;
