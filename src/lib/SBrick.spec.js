'use strict';

const sinon = require('sinon'),
    chai = require("chai"),
    SBrick = require('./SBrick'),
    proxyquire = require('proxyquire'),
    sinonChai = require("sinon-chai"),
    should = require('chai').should();

let ModuleUnderTest;

const mockNoble = {
        startScanning: sinon.stub(),
        stopScanning: sinon.stub(),
        on: sinon.stub(),
        removeAllListeners: sinon.stub()
    },
    SERVICE_UUID = '4dc591b0857c41deb5f115abda665b0c',
    CHARACTERISTIC_UUID = '02b8cbcc0e254bda8790a15f53e6010f';

chai.use(sinonChai);

describe('SBrick', function () {
    let mockPeripheral, mockCharacteristic, mockService;

    before(function() {
        ModuleUnderTest = proxyquire('./SBrick', {
            "noble": mockNoble
        });

        mockPeripheral = {
            advertisement: {
                localName: 'SBrick '
            },
            discoverServices: sinon.stub(),
            connect: sinon.stub()
        };

        mockService = {
            uuid: SERVICE_UUID,
            discoverCharacteristics: sinon.stub()
        };

        mockCharacteristic = {
            uuid: CHARACTERISTIC_UUID
        };

        // when noble.on() is called with ('stateChange', someFunc),
        // called the 2nd argument as a function with 'poweredOn' as argument.
        mockNoble.on.withArgs('stateChange', sinon.match.func).callsArgWith(1, 'poweredOn');
        mockNoble.on.withArgs('discover', sinon.match.func).callsArgWith(1, mockPeripheral);
        mockPeripheral.discoverServices.withArgs([SERVICE_UUID], sinon.match.func).callsArgWith(1, null, [mockService]);
        mockPeripheral.connect.callsArgWith(0, null);
        mockService.discoverCharacteristics.withArgs([CHARACTERISTIC_UUID], sinon.match.func).callsArgWith(1, null, [mockCharacteristic])
    });

    it('should discover a SBrick', function() {
        let moduleUnderTest = new ModuleUnderTest();

        moduleUnderTest.discoverAndConnect();
        mockNoble.startScanning.should.have.been.calledWithExactly([], false);
    });

    it('should connect to a discovered SBrick', function (done) {
        let moduleUnderTest = new ModuleUnderTest();

        moduleUnderTest.discoverAndConnect().then(function () {
            mockPeripheral.connect.should.have.been.calledWithExactly(sinon.match.func);
            moduleUnderTest.peripheral.should.equal(mockPeripheral);
            done();
        });
    });

    it('should connect to the remote control service of SBrick', function (done) {
        let moduleUnderTest = new ModuleUnderTest();

        moduleUnderTest.discoverAndConnect().then(function() {
            mockPeripheral.discoverServices.should.have.been.calledWithExactly([SERVICE_UUID], sinon.match.func);
            moduleUnderTest.service.should.equal(mockService);
            done();
        });
    });

    it('should connect to the remote control characteric of remote control service of SBrick', function (done) {
        let moduleUnderTest = new ModuleUnderTest();

        moduleUnderTest.discoverAndConnect().then(function () {
            mockService.discoverCharacteristics.should.have.been.calledWithExactly([CHARACTERISTIC_UUID], sinon.match.func);
            moduleUnderTest.characteristic.should.equal(mockCharacteristic);
            done();
        })
    });

    it('should power a channel with specified direction and power');

    it('should break on a channel');

    it('should stop a channel');
});