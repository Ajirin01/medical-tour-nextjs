import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CircleLoader } from "react-spinners";

export default function LoadingOverlay({ isLoading }) {
  return (
    <Transition show={isLoading} as={Fragment}>
      <Dialog className="relative z-50" open={isLoading} onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center">
          <CircleLoader color="#4F46E5" size={60} />
        </div>
      </Dialog>
    </Transition>
  );
}
