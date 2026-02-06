import LJXAwrap
import ctypes
import time

current_connection = {
    "connected": False,
    "ip": None,
    "port": None,
    "deviceId": 0,
}

def connect_sensor(ip, port):
    current_connection["ip"] = ip
    current_connection["port"] = port
    current_connection["deviceId"] = 0
    LJXAwrap.LJX8IF_CommunicationClose(current_connection["deviceId"])
    ethernetConfig = LJXAwrap.LJX8IF_ETHERNET_CONFIG()
    ip_parts = [int(part) for part in ip.split(".")]
    for i in range(4):
        ethernetConfig.abyIpAddress[i] = ip_parts[i]
    ethernetConfig.wPortNo = port
    res = LJXAwrap.LJX8IF_EthernetOpen(current_connection["deviceId"], ethernetConfig)
    if res == 0 or res == 4097:
        current_connection["connected"] = True
        return True
    else:
        current_connection["connected"] = False
        return False

def disconnect_sensor():
    LJXAwrap.LJX8IF_CommunicationClose(current_connection["deviceId"])
    current_connection["connected"] = False
    return True

def get_profile_from_sensor(ip=None, port=None):
    if ip is None:
        ip = current_connection["ip"]
    if port is None:
        port = current_connection["port"]
    status = {
        "connection": "OK",
        "start_measurement": "OK",
        "profile_status": "OK",
        "error_code": 0,
        "x": [],
        "z": [],
        "luminance": []
    }
    deviceId = 0

    LJXAwrap.LJX8IF_CommunicationClose(deviceId)

    ip_parts = [int(part) for part in ip.split(".")]
    ethernetConfig = LJXAwrap.LJX8IF_ETHERNET_CONFIG()
    for i in range(4):
        ethernetConfig.abyIpAddress[i] = ip_parts[i]
    ethernetConfig.wPortNo = port

    res = LJXAwrap.LJX8IF_EthernetOpen(deviceId, ethernetConfig)
    if res != 0 and res != 4097:
        status["connection"] = "Failed"
        status["error_code"] = res
        return status

    time.sleep(0.1)
    time.sleep(0.1)

    xpointNum = 6400  # ✅ Increased from 3200 to 6400
    withLumi = 1      # Include luminance data
 

    req = LJXAwrap.LJX8IF_GET_PROFILE_REQUEST()
    req.byTargetBank = 0x0
    req.byPositionMode = 0x0
    req.dwGetProfileNo = 0x0
    req.byGetProfileCount = 1
    req.byErase = 0
    req.byTargetBank = 0x0
    req.byPositionMode = 0x0
    req.dwGetProfileNo = 0x0
    req.byGetProfileCount = 1
    req.byErase = 0

    rsp = LJXAwrap.LJX8IF_GET_PROFILE_RESPONSE()
    profinfo = LJXAwrap.LJX8IF_PROFILE_INFO()

    dataSize = ctypes.sizeof(LJXAwrap.LJX8IF_PROFILE_HEADER)
    dataSize += ctypes.sizeof(LJXAwrap.LJX8IF_PROFILE_FOOTER)
    dataSize += ctypes.sizeof(ctypes.c_uint) * xpointNum * (1 + withLumi)
    dataSize *= req.byGetProfileCount

    dataNumIn4byte = int(dataSize / ctypes.sizeof(ctypes.c_uint))
    profdata = (ctypes.c_int * dataNumIn4byte)()

    time.sleep(0.01)

    res = LJXAwrap.LJX8IF_GetProfile(deviceId, req, rsp, profinfo, profdata, dataSize)
    if res != 0:
        status["profile_status"] = "Failed"
        status["error_code"] = res
        LJXAwrap.LJX8IF_CommunicationClose(deviceId)
        return status
    print("Actual profile data count:", profinfo.wProfileDataCount);
    print("Actual profile data count:", profinfo.wProfileDataCount);
    headerSize = ctypes.sizeof(LJXAwrap.LJX8IF_PROFILE_HEADER)
    addressOffset_height = int(headerSize / ctypes.sizeof(ctypes.c_uint))
    addressOffset_lumi = addressOffset_height + profinfo.wProfileDataCount

    x_vals = []
    z_vals = []
    lumi_vals = []
    
    for i in range(profinfo.wProfileDataCount):
        x_val = profinfo.lXStart + profinfo.lXPitch * i
        x_val_mm = x_val / 1_000_000.0  # nanometers → millimeters

        
        z_raw = profdata[addressOffset_height + i]
        if z_raw <= -4600001:
            z_val_mm = 0
        
        else:
            z_val_mm = (z_raw / 100000.0)+46  # to mm

        lumi_val = profdata[addressOffset_lumi + i]

        x_vals.append(x_val_mm)

        x_vals.append(x_val_mm)
        z_vals.append(z_val_mm)
        lumi_vals.append(lumi_val)

    LJXAwrap.LJX8IF_CommunicationClose(deviceId)

    status["x"] = x_vals
    status["z"] = z_vals
    status["luminance"] = lumi_vals
    if z_vals:
        print("Minimum Z value (mm):", min(z_vals))
        print("max Z value (mm):", max(z_vals))
    else:
        print("Warning: No Z values received. Profile may be empty or invalid.")

    return status
    return status

