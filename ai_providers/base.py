from abc import ABC, abstractmethod


class AIProvider(ABC):

    @abstractmethod
    def process_discharge(self, extracted_text: str) -> dict:
        pass
