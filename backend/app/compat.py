"""
TradePulse AI - Model Compatibility Layer
Provides Pydantic BaseModel or standard library fallback
Maintained by: Gatha Jain (@gathajain04-ui)
"""

try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

        def dict(self):
            result = {}
            for k, v in self.__dict__.items():
                if isinstance(v, BaseModel):
                    result[k] = v.dict()
                elif isinstance(v, list):
                    result[k] = [item.dict() if isinstance(item, BaseModel) else item for item in v]
                else:
                    result[k] = v
            return result
