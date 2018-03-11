import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const style = props.squareIsWinner ? {fontWeight: 'bold'} : {};
  return (
    <button style={style} className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  isSquareWinner(winningIndices, i) {
    if (winningIndices) {
      return this.props.winningIndices.includes(i)
    }

    return false;
  }

  renderSquare(i) {
    return (<Square
      key={i}
      squareIsWinner={this.isSquareWinner(this.props.winningIndices, i)}
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)} />);
  }

  renderSquares() {
    const rows = [];
    for (let i = 0, j = 0; j < 3; j++) {
      const columns = [];
      for (let k = 0; k < 3; k++) {
        columns.push(this.renderSquare(i));
        i++;
      }

      rows.push(
        <div key={j} className="board-row">
          {columns}
        </div>
      );
    }

    return (rows);
  }

  render() {
    return (
      <div>
        {this.renderSquares()}
      </div>
    );
  }
}

function OrderButton(props) {
  return (
    <button className="orderToggle" onClick={props.onClick}>Toggle list order</button>
  );
}

class GameInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderIsAscending: true,
    };
  }

  handleClick() {
    this.setState({
      orderIsAscending: !this.state.orderIsAscending,
    });
  }

  render() {
    let status;
    if (this.props.winningIndices) {
      status = 'Winner: ' + this.props.squares[this.props.winningIndices[0]];
    } else if (!this.props.squares.includes(null)) {
      status = 'Draw';
    } else {
      status = 'Next player: ' + (this.props.xIsNext ? 'X' : 'O');
    }

    const moveHistoryList = this.props.history.map((currentValue, index) => {
      const desc = index ? `Go to index #${index} (${currentValue.col}, ${currentValue.row})` : 'Go to game start';
      const player = (index % 2) ? 'O' : 'X';
      const style = this.props.stepNumber === index ? {fontWeight: 'bold'} : {};
      return (
        <li key={index}>
          <button style={style} onClick={() => this.props.onClick(index)}>{desc} {player}</button>
        </li>
      );
    });

    return (
      <div className="game-info">
        <div>{status}</div>
        <OrderButton onClick={() => this.handleClick()} />
        <ol>{this.state.orderIsAscending ? moveHistoryList : moveHistoryList.reverse()}</ol>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  calculateWinner(squares) {

    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return lines[i];
      }
    }
    return null;
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (this.calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    const row = Math.floor(i / 3) + 1;
    const col = i % 3 + 1;
    this.setState({
      history: history.concat([{
        squares: squares,
        row: row,
        col: col,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winningIndices = this.calculateWinner(current.squares);

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningIndices={winningIndices}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <GameInfo
          stepNumber={this.state.stepNumber}
          xIsNext={this.state.xIsNext}
          history={history}
          squares={current.squares}
          winningIndices={winningIndices}
          onClick={(movesIndex) => this.jumpTo(movesIndex)}
        />
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
