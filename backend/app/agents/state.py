from typing import TypedDict, Optional, Dict, Any, List

class Critique(TypedDict):
    score : int
    strength : str
    weakness : str
    suggestion : str

class AgentState(TypedDict):
    original_prompt : str
    current_prompt : str
    critique : Optional[Critique]
    iteration : int 
    max_iterations : int

    creator_model : Optional[str]
    critic_model : Optional[str]
    
    history : List[Dict[str, Any]]
    metadata : Dict[str, Any]