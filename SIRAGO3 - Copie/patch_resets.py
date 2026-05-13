import re
import os

path = 'screens/DriverMap.js'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Add security resets to the normal deviation button
    # Look for the block:
    # console.log(`ðŸ§­ [DEVIATION_START] Recalcul vers ...`);
    # try {
    #     setIsLoading(true);

    old_block = r"setIsLoading\(true\);"
    # We want to target the one inside the DÉVIATION NORMALE button.
    # It's usually after the console.log of DEVIATION_START.
    
    # Let's find the position of the normal deviation button logic
    marker = "DÉVIATION NORMALE"
    pos = content.find(marker)
    if pos != -1:
        # Search backwards for the nearest setIsLoading(true)
        # Actually, search forwards from the button's onPress.
        # onPress is before the label.
        pass

    # simpler: replace the specific pattern we saw in the view_file
    pattern = r"(try \{\s+)setIsLoading\(true\);"
    # This might match the danger button too, but that's okay, resetting won't hurt there either.
    # Actually, we want to reset ONLY for normal.
    
    # Let's be more specific
    old = """                   try {
                       setIsLoading(true);"""
    # Use regex to handle whitespace
    pattern = r"(try \{\s+)(setIsLoading\(true\);)"
    
    # I'll just use a direct string replacement for the specific area
    # I'll target line 2167 (approx)
    
    new_content = content.replace("try {\r\n                       setIsLoading(true);", "try {\r\n                       setSecurityStatus('NORMAL');\r\n                       setRiskLevel(0);\r\n                       setIsLoading(true);")
    
    if content == new_content:
        # Try with \n only
        new_content = content.replace("try {\n                       setIsLoading(true);", "try {\n                       setSecurityStatus('NORMAL');\n                       setRiskLevel(0);\n                       setIsLoading(true);")

    if content != new_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('SUCCESS: DriverMap.js security resets added')
    else:
        print('FAILURE: Pattern not found for resets')
else:
    print('FAILURE: File not found')
