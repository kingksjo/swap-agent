# agent/smoke.py
from llm_client import llm
msg = llm.invoke("Who is billy joel ?")
print(msg.content)