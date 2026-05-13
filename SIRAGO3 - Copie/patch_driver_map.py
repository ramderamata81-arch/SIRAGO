import re
import os

path = 'screens/DriverMap.js'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Target the specific block in DriverMap.js
    # Looking for:
    # phase: 'trip',
    # reason: 'manual_driver_deviation'
    
    pattern = r"(phase:\s*)'trip'(,\s*reason:\s*)'manual_driver_deviation'"
    new_content = re.sub(pattern, r"\1'normal'\2'traffic_detour'", content)

    if content != new_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('SUCCESS: DriverMap.js patched')
    else:
        # Try a more flexible pattern in case of different quotes or spacing
        pattern2 = r"phase:\s*['\"]trip['\"]\s*,\s*reason:\s*['\"]manual_driver_deviation['\"]"
        new_content2 = re.sub(pattern2, "phase: 'normal', reason: 'traffic_detour'", content)
        if content != new_content2:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content2)
            print('SUCCESS: DriverMap.js patched (fallback)')
        else:
            print('FAILURE: Pattern not found')
else:
    print(f'FAILURE: File {path} not found')
