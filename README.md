# Introduction

This is an API written in TypeScript with NestJS framework for communicating with IoT devices (ESP32) in order to take the data from the sensors (such as light sensor, humidity sensor,...), save it, and make reports. This API also supports controlling some output IoT devices by utilizing MQTT protocol and Eclipse Mosquitto Broker.

# Compile and run the project

```
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
