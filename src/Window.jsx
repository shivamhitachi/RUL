/**
 * @file      : Window.jsx
 * @summary   : 
 * @author    : Charles Best <cbest@nvidia.com>
 * @created   : 2023-12-14
 * @copywrite : 2023 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 * @exports   : Window
 */

import React from 'react';
import './App.css';
import ColorControls from './ColorControls.jsx';
import BackgroundControls from './BackgroundControls.jsx';
import AppStream from './AppStream.jsx';
import InfoCard from './InfoCard.jsx';
import StreamConfig from '../stream.config.json';
import keycloak from './keycloak';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            setColor    : '',
            setBackdrop : '',
            gfnUser     : null,   // User is authenticated
            showChart: true,
            showRul: true,
            streamReady : false,   // Stream is ready to display
            label: ''
        }
    }

    _handleLogout = () => {
        keycloak.logout({ redirectUri: 'http://localhost:5173/' });
    };

    /**
     * @function _onStreamStarted
     *
     * Pulls all user-selected values from localStorage and passes them to
     * the streaming application.
     */
    _onStreamStarted() {
        const states = JSON.parse(localStorage.getItem('states') || '[]');

        states.forEach(state => {
            // The user had a previous session. Make request to set kit app state.
            const message = this._generateCustomMessageFromState(state);
            this.setState(
                {[state.event]: state.value},
                () => AppStream.sendMessage(message)
            );
        });
    }

    /**
     * @function _generateCustomMessageFromState
     *
     * Converts state to the custom configurator purse example event
     * structure.
     *
     *  NOTE: This structure must be modified to work with other custom
     *        sample action graph setups.
     *
     * @param   {string} state
     * @returns {*}
     */
    _generateCustomMessageFromState(state) {
        return JSON.stringify({
            event_type : state.event,
            payload    : {
                [state.attributeName]: state.value
            }
        });
    }

    /**
     * @function _onSelected
     *
     * Writes the input state into the localStorage states list.
     *
     * @param {*} state 
     */
    _onSelected(state) {
        const storeSelection = () => {
            // Adds the input state localStorage.states.

            const states  = JSON.parse(localStorage.getItem('states') || '[]');
            const currVal = states.findIndex(item => item.event === state.event);

            if ( currVal > -1 ) {
                states[currVal] = state;
            }
            else {
                states.push(state);
            }

            localStorage.setItem('states', JSON.stringify(states));
        }

        this.setState(
            {[state.event]: state.value},
            () => AppStream.sendMessage(
                this._generateCustomMessageFromState(state),
                storeSelection
            )
        );
    }

    /**
     * @function _onSelectColor
     *
     * Updates the object color state and notifies
     * the GFN stream.
     *
     * @param {string} option 
     */
    _onSelectColor(option) {
        const state = {
            event         : 'EVENT_NAME',
            attributeName : 'ATTRIBUTE_NAME',
            value         : option
        };

        this._onSelected(state);
    }

        /**
     * @function _onSelectView
     *
     * Set the camera view choice and notifies
     * the GFN stream.
     *
     * @param {string} option 
     */
    _onSelectView(option) {
        const state = {
            event         : 'set_view',
            attributeName : 'view',
            value         : option
        };

        this._onSelected(state);
    }

    /**
     * @function _onSelectBackground
     *
     * Updates the object background state and notifies
     * the GFN stream.
     *
     * @param {string} option 
     */
    _onSelectBackground(option) {
        const state = {
            event         : 'setBackdrop',
            attributeName : 'backdrop',
            value         : option
        };

        this._onSelected(state);
    }

    _handleCustomEvent(event){
        console.log("onCustomEvent");
        console.log(event);
        if(!event){
            return;
        }
        //messages from kit to app
        if(event.event_type === "primChanged"){
            console.log('Kit App communicates stage selection: ' + event.payload?.selectedPrims[0])
            this.setState({label: event.payload?.selectedPrims[0]})
        }
        //messages from kit to app
        else if(event.event_type === "setColorResponse"){
            console.log('Kit App confirms color selection: ' + event.payload?.color)
            this.state.setColor = event.payload?.color
        }
        //messages from kit to app
        else if(event.event_type === "setBackdropResponse") {
            console.log('Kit App confirms backdrop selection: ' + event.payload?.backdrop)
            this.state.setBackdrop = event.payload?.backdrop
        }
        //messages from app to kit
        else if (event.messageRecipient === "kit") {
            console.log(JSON.parse(event.data).event_type)
        }
    }

    toggleChart = () => {
        this.setState(prev => ({ showChart: !prev.showChart }));
        }

    toggleRul = () => {
        this.setState(prev => ({ showRul: !prev.showRul }));
        }

    render() {
        const sidebarWidth = 250;
        const streamConfig = StreamConfig.source === 'gfn' ? {
            ...StreamConfig[StreamConfig.source],
            source: StreamConfig.source,
            GFN: GFN
        } : {
            ...StreamConfig[StreamConfig.source],
            source: StreamConfig.source
        };


        return (
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden',
                    backgroundColor: 'black'  // Optional, helps hide any edge gaps
                }}
            >

                    {/* Top header panel */}
                    <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0, // ensure no width overflow
                        height: '50px',
                        backgroundColor: 'rgba(0, 0, 0, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 20px',
                        boxSizing: 'border-box', // ensure padding doesn't overflow
                        zIndex: 1000
                    }}
                    >
                    <div style={{
                    color: '#ffffff',
                    fontSize: '28px',         
                    fontWeight: '700',
                    letterSpacing: '1.5px',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
                    fontFamily: 'Segoe UI, sans-serif' // or a custom font later
                    }}>
                    Remaining Useful Life (RUL)
                    </div>

                    <button
                        style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '14px',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
                        cursor: 'pointer'
                        }}
                        onClick={this._handleLogout}
                    >
                        Sign Out
                    </button>
                    </div>

                    <AppStream
                        streamConfig={streamConfig}
                        onLoggedIn={(userId) => this.setState({ gfnUser: userId })}
                        onStarted={() => this._onStreamStarted()}
                        handleCustomEvent={(event) => this._handleCustomEvent(event)}
                    />

                    
                    {this.state.showChart && (
                    <iframe
                    src="http://localhost:3000/d-solo/910c19ae-a33e-4a08-89fe-4f0cf272616e/rul-dashboard?orgId=1&from=now-15m&to=now&timezone=browser&refresh=5s&panelId=1&theme=light"
                    style={{
                        position: 'absolute',
                        top: 'calc(40% + 100px)', // to sit below the button panel
                        left: '20px',
                        width: '30%',
                        height: '25%',
                        border: 'none',
                        backgroundColor: 'unset',
                        zIndex: 1000,
                        opacity: 0.8,
                        pointerEvents: 'auto'
                    }}
                    frameBorder="0"
                    allowTransparency={true}
                    />
                    )}

                    {this.state.showRul && (
                    <iframe
                    src="http://localhost:3000/d-solo/910c19ae-a33e-4a08-89fe-4f0cf272616e/rul-dashboard?orgId=1&from=now-15m&to=now&timezone=browser&refresh=5s&panelId=2&theme=dark"
                    style={{
                        position: 'absolute',
                        top: 'calc(90px + 30px)', // to sit below the button panel
                        right: '20px',
                        width: '250px',
                        //height: '150px',
                        border: 'none',
                        backgroundColor: 'unset',
                        zIndex: 1000,
                        //opacity: 0.8,
                        pointerEvents: 'auto'
                    }}
                    frameBorder="0"
                    allowTransparency={true}
                    />
                    )}
                    
                    {/* Left-side floating control panel */}
                    <div
                    style={{
                        position: 'absolute',
                        top: '40%',
                        left: '20px',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        padding: '10px',
                        borderRadius: '10px',
                        zIndex: 1000,
                        pointerEvents: 'auto',
                        height: '160px' //fixed height so we can align chart under it
                    }}
                    >
                    <button 
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '6px',
                            backdropFilter: 'blur(8px)',
                            padding: '6px 10px',
                            fontSize: '14px',
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
                            cursor: 'pointer'
                        }}
                        onClick={() => this._onSelectView("overview")}
                    >Overview</button>    

                    <button 
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '6px',
                            backdropFilter: 'blur(8px)',
                            padding: '6px 10px',
                            fontSize: '14px',
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
                            cursor: 'pointer'
                        }}
                        onClick={() => this._onSelectView("pump1")}
                    >Motor 1</button>

                    <button 
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '6px',
                            backdropFilter: 'blur(8px)',
                            padding: '6px 10px',
                            fontSize: '14px',
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
                            cursor: 'pointer'
                        }}
                        onClick={() => this._onSelectView("pump2")}
                    >Motor 2 (WIP)</button>

                    <button style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '50%',
                        backdropFilter: 'blur(8px)',
                        padding: '8px 12px', // space inside
                        fontSize: '16px',
                        cursor: 'pointer',
                        textAlign: 'center',
                    }}
                    onClick={this.toggleChart}
                    >Anomaly 📊</button>
                    </div>

                    {/* Right-side floating control panel */}
                    <div
                    style={{
                        position: 'absolute',
                        top: '90px',
                        right: '20px',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        padding: '10px',
                        borderRadius: '10px',
                        zIndex: 1000,
                        pointerEvents: 'auto',
                        height: '40px' //fixed height so we can align chart under it
                    }}
                    >
                    <button
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '50%',
                        backdropFilter: 'blur(8px)',
                        padding: '8px 12px', // space inside
                        fontSize: '16px',
                        cursor: 'pointer',
                        textAlign: 'center',
                    }}
                    onClick={this.toggleRul}
                    >
                    RUL 📊
                    </button>
                    </div>

                    {/* Bottom Left - Digital Services with icon */}
                    <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '16px',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
                    zIndex: 1000
                    }}>
                    <img
                        src="https://itviec.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMzNkUGc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--a4ae8f01daaa02a0bcc2affea52053f65c58e138/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFJc0FXa0NMQUU9IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--15c3f2f3e11927673ae52b71712c1f66a7a1b7bd/Hitachi-Shield-Mark-Red-White-Background-200x200.png" // Replace this URL with your icon
                        alt="icon"
                        style={{ width: '20px', height: '20px', marginRight: '8px' }}
                    />
                    Hitachi Digital Services
                    </div>

                    {/* Bottom Right - Maintenance Dashboard & Digital Twin */}
                    <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    padding: '10px 14px',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '16px',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
                    textAlign: 'right',
                    zIndex: 1000
                    }}>
                    <div>Maintenance Dashboard & Digital Twin</div>
                    </div>

                {/*this.state.gfnUser &&
                    <>
                        <BackgroundControls
                            width    = {`calc(100% - ${sidebarWidth}px)`}
                            options  = {[{label: 'PLINTHS', value: 'Plinths'}, {label: 'DESK', value: 'Desk'}, {label: 'MARBLE WALL', value: 'MarbleWall'}]}
                            selected = {this.state.setBackdrop}
                            onSelect = {(value) => this._onSelectBackground(value)}
                        />
                        <ColorControls
                            width    = {sidebarWidth}
                            options  = {[{label: 'WHITE', value: 'White'}, {label: 'BLACK', value: 'Black'}]}
                            selected = {this.state.setColor}
                            onSelect = {(value) => this._onSelectColor(value)}
                        />
                        <InfoCard
                            title = {this.state.label || 'Try selecting something in USD Stage'}
                        />
                    </>
                */}
            </div>
        );
    }
}
