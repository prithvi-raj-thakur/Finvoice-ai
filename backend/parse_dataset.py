import os
import json
import glob

def parse_dataset(dataset_dir="dataset", output_file="compiled_schemes.json"):
    schemes = []
    
    # Iterate through each state directory
    for state_dir in os.listdir(dataset_dir):
        state_path = os.path.join(dataset_dir, state_dir)
        if not os.path.isdir(state_path):
            continue
            
        state_name = state_dir.replace("-", " ").title()
        if state_name.lower() == "central":
            state_name = "All"
            
        # Iterate through text files in the state directory
        for txt_file in glob.glob(os.path.join(state_path, "*.txt")):
            try:
                with open(txt_file, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = [line.strip() for line in f.readlines() if line.strip()]
                    
                if not lines:
                    continue
                    
                # The first line is usually the scheme name
                scheme_name = lines[0]
                
                # The rest is description and details
                full_text = "\n".join(lines[1:])
                
                # Try to extract website if present
                website = ""
                for line in lines:
                    if "http" in line:
                        parts = line.split("http")
                        website = "http" + parts[1].strip()
                        break
                        
                scheme = {
                    "scheme_name": scheme_name,
                    "description": full_text[:1000] + ("..." if len(full_text) > 1000 else ""), # Limit length
                    "full_text": full_text,
                    "state": state_name,
                    "application_url": website,
                    "source": "Kaggle Indian Government Schemes Dataset"
                }
                schemes.append(scheme)
            except Exception as e:
                print(f"Error processing {txt_file}: {e}")
                
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(schemes, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully compiled {len(schemes)} schemes into {output_file}")

if __name__ == "__main__":
    parse_dataset()
