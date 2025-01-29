// ==UserScript==
// @name         WebRTC, AudioContext and WebGL Randomizer
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Randomizes WebRTC, AudioContext, and WebGL API data
// @author       YourName
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const getRandom = (min, max) => Math.random() * (max - min) + min;

    // WebRTC Manipulation
    if (navigator.mediaDevices) {
        const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
        navigator.mediaDevices.getUserMedia = function (constraints) {
            console.warn('Randomized WebRTC data');
            return new Promise((resolve, reject) => {
                resolve({
                    getTracks: () => [],
                    getVideoTracks: () => [],
                    getAudioTracks: () => [],
                    id: Math.random().toString(36).substr(2, 9),
                });
            });
        };
    }

    // AudioContext Manipulation
    if (window.AudioContext || window.webkitAudioContext) {
        const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;

        class FakeAudioContext extends OriginalAudioContext {
            constructor() {
                super();
                console.warn('AudioContext manipulated');
            }

            createAnalyser() {
                const analyser = super.createAnalyser();
                const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;

                analyser.getFloatFrequencyData = function (array) {
                    console.warn('Randomizing AudioContext frequency data');
                    for (let i = 0; i < array.length; i++) {
                        array[i] = getRandom(-100, 0);
                    }
                };

                return analyser;
            }

            createOscillator() {
                const oscillator = super.createOscillator();
                console.warn('Oscillator randomized');
                return oscillator;
            }
        }

        window.AudioContext = FakeAudioContext;
        window.webkitAudioContext = FakeAudioContext;
    }

    // WebGL Manipulation
    const randomizeWebGL = (target) => {
        const proto = target.prototype || target.__proto__;

        proto.getParameter = new Proxy(proto.getParameter, {
            apply(target, self, args) {
                const param = args[0];
                const randomValues = {
                    37445: `RandomVendor-${Math.random().toString(36).substr(2, 5)}`,
                    37446: `RandomRenderer-${Math.random().toString(36).substr(2, 5)}`,
                };

                if (param in randomValues) {
                    console.warn(`WebGL randomized parameter: ${param}`);
                    return randomValues[param];
                }

                return Reflect.apply(target, self, args);
            },
        });

        proto.getExtension = new Proxy(proto.getExtension, {
            apply(target, self, args) {
                console.warn(`WebGL extension requested: ${args[0]}`);
                return Reflect.apply(target, self, args);
            },
        });
    };

    if (window.WebGLRenderingContext) {
        randomizeWebGL(WebGLRenderingContext);
    }

    if (window.WebGL2RenderingContext) {
        randomizeWebGL(WebGL2RenderingContext);
    }

    console.warn('WebRTC, AudioContext, and WebGL randomization active');
})();