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
    steer : Optional[str]

    test_inputs : Optional[List[str]]
    test_model : Optional[str]
    assertions : Optional[List[Dict[str, Any]]]
    test_outputs : List[Dict[str, Any]]
    assertion_results : Dict[str, Any]

    # Orchestrator (P2)
    autonomy : str
    orchestrator_model : Optional[str]
    gated : bool
    budget : Dict[str, Any]
    steps_used : int
    decisions : List[Dict[str, Any]]
    next_action : Optional[str]
    pending_action : Optional[str]
    awaiting_approval : bool
    resume_approved : bool
    focus : Optional[str]
    termination_reason : Optional[str]
    
    history : List[Dict[str, Any]]
    metadata : Dict[str, Any]

    usage : Dict[str, Any]
    iter_usage : Dict[str, Any]
