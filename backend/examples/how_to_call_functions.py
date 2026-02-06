
"""
Example: How to call basic sensor functions

This script demonstrates how the backend logic or SDK wrapper
can be used to configure the sensor, connect, read status,
and disconnect.

Vendor SDK binaries are assumed to be available locally
but are not included in this repository.
"""

from app.sensor_logic import (
    set_sensor,
    connect_sensor,
    get_status,
    disconnect_sensor
)

def main():
    # Configure sensor connection parameters
    config = {
        "ip": "192.168.0.10",
        "port": 24691
    }

    print("Setting sensor configuration...")
    print(set_sensor(config))

    print("Connecting to sensor...")
    print(connect_sensor())

    print("Reading sensor status...")
    status = get_status()
    print(status)

    print("Disconnecting sensor...")
    print(disconnect_sensor())

if __name__ == "__main__":
    main()
