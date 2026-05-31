from typing import TypedDict, Optional, Dict, Any, List

class Critique(TypedDict, total=False):
    score : int
    strengths : List[str]
    weaknesses : List[str]
    suggestions : List[str]

class AgentState(TypedDict):
    original_prompt : str
    current_prompt : str
    critique : Optional[Critique]
    iteration : int 
    max_iterations : int

    creator_model : Optional[str]
    critic_model : Optional[str]

    target_tool : Optional[str]
    project_type : Optional[str]
    stack : Optional[str]
    
    history : List[Dict[str, Any]]
    metadata : Dict[str, Any]
