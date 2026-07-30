import re
import os

# 1. Parse lint-output.txt to find unused variables and remove them
def process_lint():
    with open('lint-output.txt', 'r') as f:
        lines = f.readlines()
    
    current_file = None
    unused_by_file = {}
    
    for line in lines:
        if line.startswith('/'):
            current_file = line.strip()
            if current_file not in unused_by_file:
                unused_by_file[current_file] = []
        elif 'is defined but never used' in line and current_file:
            # Extract the variable name
            match = re.search(r"'([^']+)' is defined but never used", line)
            if match:
                var_name = match.group(1)
                unused_by_file[current_file].append(var_name)
    
    for file, vars in unused_by_file.items():
        if not vars: continue
        try:
            with open(file, 'r') as f:
                content = f.read()
            
            for var in set(vars):
                # We need to remove the variable from imports
                # Matches: import { ..., Var, ... } from "..."
                # Or import Var from "..."
                content = re.sub(r'(\b)' + var + r'\b\s*,\s*', r'\1', content)
                content = re.sub(r',\s*(\b)' + var + r'\b', '', content)
                content = re.sub(r'\{\s*' + var + r'\s*\}', '{}', content)
                # If the line ends up with import {} from "...", remove it
                content = re.sub(r'import\s*\{\s*\}\s*from\s*["\'][^"\']+["\'];?\n?', '', content)
                
            with open(file, 'w') as f:
                f.write(content)
        except Exception as e:
            print(f"Error processing {file}: {e}")

# 2. Find and remove console.log, TODO, FIXME, HACK, TEMP
def clean_file(filepath):
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        new_lines = []
        modified = False
        for line in lines:
            if 'console.log(' in line or 'console.warn(' in line:
                modified = True
                continue
            if re.search(r'//\s*(TODO|FIXME|HACK|TEMP)', line):
                modified = True
                continue
            new_lines.append(line)
        
        if modified:
            with open(filepath, 'w') as f:
                f.writelines(new_lines)
            print(f"Cleaned {filepath}")
    except Exception as e:
        pass

def clean_all():
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                clean_file(os.path.join(root, file))

if __name__ == '__main__':
    process_lint()
    clean_all()
