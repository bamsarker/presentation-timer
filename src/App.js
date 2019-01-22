import React, { Component } from 'react'
import './App.css'
import ArrowButton from './components/ArrowButton'

const redTimes = ['01:00', '00:30', '00:15', '00:10', '00:05', '00:03', '00:01']

const states = {
  TIMING: 'timing',
  PAUSED: 'paused',
  IDLE: 'IDLE'
}

class App extends Component {
  state = {
    state: states.IDLE,
    timing: false,
    startTime: undefined,
    totalTime: 5 * 60 * 1000,
    timeRemaining: undefined,
    pauseIntervals: []
  }

  componentDidMount() {
    document.addEventListener('keydown', event => {
      if (event.code === 'Space') {
        this.isIdle()
          ? this.startTimer()
          : this.isPaused()
            ? this.resumeTimer()
            : this.pauseTimer()
      }
    })
  }

  calculateTimeRemaining = (start, total, pauseTime) => {
    const rem = total - (Date.now() - start) + pauseTime
    return rem < 0 ? 0 : rem
  }

  updateTimer = () => {
    this.setState(
      {
        timeRemaining: this.calculateTimeRemaining(
          this.state.startTime,
          this.state.totalTime,
          this.state.pauseIntervals.reduce((total, interval) => total + ((interval.end || interval.start) - interval.start), 0)
        )
      },
      () => {
        if (this.state.state === states.TIMING) {
          if (this.state.timeRemaining > 0) {
            requestAnimationFrame(this.updateTimer)
          } else {
            this.setState({
              state: states.PAUSED
            })
          }
        }
      }
    )
  }

  startTimer = () => {
    this.setState({
      startTime: Date.now(),
      state: states.TIMING
    })
    requestAnimationFrame(this.updateTimer)
  }

  resumeTimer = () => {
    this.setState({
      state: states.TIMING,
      pauseIntervals: this.state.pauseIntervals.map((interval, i) => {
        if (i < this.state.pauseIntervals.length - 1) return interval
        interval.end = Date.now()
        return interval
      })
    })
    requestAnimationFrame(this.updateTimer)
  }

  pauseTimer = () => {
    this.setState({
      state: states.PAUSED,
      pauseIntervals: [...this.state.pauseIntervals, { start: Date.now() }]
    })
  }

  reset = () => {
    this.setState({
      state: states.IDLE,
      timeRemaining: this.state.totalTime,
      pauseIntervals: []
    })
  }

  formatTime = time => {
    const minute = time.getMinutes()
    const second = time.getSeconds()
    let timeString = (minute < 10 ? '0' : '') + minute
    timeString += (second < 10 ? ':0' : ':') + second
    return timeString
  }

  adjustTime = diff => {
    this.setState({
      totalTime: this.state.totalTime + diff
    })
  }

  wrapButtons = buttons =>
    this.state.state === states.TIMING || this.state.state === states.PAUSED ? (
      <div className="buttonSpacer" />
    ) : (
        buttons
      )

  upButtons = () =>
    this.wrapButtons(
      <div className="buttonContainer">
        <ArrowButton
          direction={'up'}
          onClick={() => this.adjustTime(1000 * 60)}
        />
        <ArrowButton direction={'up'} onClick={() => this.adjustTime(1000)} />
      </div>
    )

  downButtons = () =>
    this.wrapButtons(
      <div className="buttonContainer">
        <ArrowButton
          direction={'down'}
          onClick={() => this.adjustTime(-1000 * 60)}
        />
        <ArrowButton
          direction={'down'}
          onClick={() => this.adjustTime(-1000)}
        />
      </div>
    )

  showTime = () => {
    const { timeRemaining, totalTime } = this.state
    const showTimeRemaining =
      this.state.state === states.TIMING || this.state.state === states.PAUSED
    const time = showTimeRemaining ? timeRemaining : totalTime
    return this.formatTime(new Date(time))
  }

  shouldBeRed = (timing, timeRemaining) => {
    return (
      timing &&
      redTimes.includes(this.formatTime(new Date(timeRemaining))) &&
      'red'
    )
  }

  isIdle = () => this.state.state === states.IDLE
  isPaused = () => this.state.state === states.PAUSED
  isTiming = () => this.state.state === states.TIMING

  startPauseButton = () => (
    <button
      className="startButton"
      onClick={
        this.isIdle()
          ? this.startTimer
          : this.isPaused()
            ? this.resumeTimer
            : this.pauseTimer
      }
    >
      {this.isTiming() ? '❚❚' : '▶'}
    </button>
  )

  restartButton = disabled => (
    <button className="resetButton" onClick={this.reset} disabled={disabled}>
      ■
    </button>
  )

  controlButtons = () => (
    <div className="controlButtons">
      {this.startPauseButton()}
      {this.restartButton(this.isIdle())}
    </div>
  )

  render() {
    return (
      <div className="App">
        <header
          className={`App-header ${this.shouldBeRed(
            this.isTiming(),
            this.state.timeRemaining
          )}`}
        >
          {this.upButtons()}
          <div className="time">{this.showTime()}</div>
          {this.downButtons()}
          {this.controlButtons()}
        </header>
      </div>
    )
  }
}

export default App
