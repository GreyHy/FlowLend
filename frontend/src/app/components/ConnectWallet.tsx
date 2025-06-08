'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NetworkSwitcher } from './NetworkSwitcher';

export function ConnectWallet() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    连接钱包
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <div className="flex items-center gap-2">
                    <NetworkSwitcher />
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      切换网络
                    </button>
                  </div>
                );
              }

              return (
                <div className="flex gap-2">
                  <NetworkSwitcher />

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center rounded-xl bg-blue-600 px-3 py-2 text-sm text-white"
                  >
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
} 