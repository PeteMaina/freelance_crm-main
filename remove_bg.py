from PIL import Image
import os

def remove_background(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    # Get the background color from top-left pixel
    bg_color = datas[0]
    
    new_data = []
    for item in datas:
        # Match colors within a small threshold
        if all(abs(item[i] - bg_color[i]) < 30 for i in range(3)):
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Processed {input_path} -> {output_path}")

logo_dir = r"f:\freelance_crm-main\freelance_crm-main\frontend\src\logo"
remove_background(os.path.join(logo_dir, "brand_logo.png"), os.path.join(logo_dir, "brand_logo_clean.png"))
remove_background(os.path.join(logo_dir, "favicon_logo.png"), os.path.join(logo_dir, "favicon_logo_clean.png"))
