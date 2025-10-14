
import os
import hashlib
from collections import defaultdict

def get_all_files(directory):
    for root, dirs, files in os.walk(directory):
        if '.git' in dirs:
            dirs.remove('.git')
        for file in files:
            yield os.path.join(root, file)

def hash_file(filename):
    hasher = hashlib.sha256()
    try:
        with open(filename, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()
    except (IOError, OSError):
        return None

def find_duplicates(files):
    hashes = defaultdict(list)
    for file in files:
        file_hash = hash_file(file)
        if file_hash:
            hashes[file_hash].append(file)
    return {hash_val: file_list for hash_val, file_list in hashes.items() if len(file_list) > 1}

def main():
    all_files = list(get_all_files('.'))
    duplicates = find_duplicates(all_files)
    unique_files_count = len(all_files) - sum(len(file_list) for file_list in duplicates.values()) + len(duplicates)

    print("# Project Audit Report\n")
    print(f"Total files found: {len(all_files)}")
    print(f"Unique files: {unique_files_count}")
    print(f"Duplicate files: {sum(len(file_list) for file_list in duplicates.values()) - len(duplicates)}\n")

    print("\n## Duplicate Files\n")
    if duplicates:
        for hash_val, file_list in duplicates.items():
            print(f"### Hash: {hash_val}")
            for file in file_list:
                print(f"- {file}")
            print("\n")
    else:
        print("No duplicate files found.")

if __name__ == "__main__":
    main()
