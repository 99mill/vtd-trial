import os


def print_folder_structure(path, exempt_folders, exempt_files, file_handle):
    file_handle.write("Folder Structure:\n")
    for root, dirs, files in os.walk(path, topdown=True):
        # Modify the 'dirs' list in-place to skip exempt directories
        dirs[:] = [d for d in dirs if d not in exempt_folders]

        level = root.replace(path, '').count(os.sep)
        indent = ' ' * 4 * (level)
        file_handle.write(f'{indent}{os.path.basename(root)}/\n')

        subindent = ' ' * 4 * (level + 1)
        for f in files:
            if f not in exempt_files:
                file_handle.write(f'{subindent}{f}\n')


def print_file_contents(path, exempt_folders, exempt_files, file_handle):
    file_handle.write("\nFile Contents:\n")
    for root, dirs, files in os.walk(path, topdown=True):
        # Skip printing file contents for exempt directories
        if any(exempt_dir in root for exempt_dir in exempt_folders):
            continue

        for f in files:
            if f not in exempt_files:
                file_path = os.path.join(root, f)
                try:
                    file_handle.write(f'File: {file_path}\n')
                    with open(file_path, 'r', encoding='utf-8') as file:
                        contents = file.read()
                        file_handle.write('--- File Contents Start ---\n')
                        file_handle.write(contents + '\n')
                        file_handle.write('--- File Contents End ---\n\n')
                except Exception as e:
                    file_handle.write(f'Failed to read {file_path}: {e}\n\n')


# Exempt directories and files
exempt_folders = [
    'node_modules',
    '.git',
    'image',
]
exempt_files = [
    '.DS_Store',
    '.gitignore',
    'config.json',
    'package-lock.json',
    'package.json',
    'README.md',

    'manifest.json',

    'project.py',
    'project.txt',
    'wine_data.xlsx',
]

# Change 'your_project_path' to the path of your project directory
your_project_path = '../../vtd-trial'

# Writing output to project.txt
with open('project.txt', 'w', encoding='utf-8') as output_file:
    print_folder_structure(
        your_project_path, exempt_folders, exempt_files, output_file)
    print_file_contents(your_project_path, exempt_folders,
                        exempt_files, output_file)
