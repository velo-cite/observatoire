<?php

namespace App\EventSubscriber\Admin;

use App\Entity\Article;
use EasyCorp\Bundle\EasyAdminBundle\Event\BeforeEntityUpdatedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ArticleSubscriber implements EventSubscriberInterface
{
    public function onBeforeEntityUpdatedEvent($event): void
    {
        $entity = $event->getEntityInstance();
        if (! ($entity instanceof Article)) {
            return;
        }
        $entity->setDateModification(new \DateTime());
    }

    public static function getSubscribedEvents(): array
    {
        return [
            BeforeEntityUpdatedEvent::class => 'onBeforeEntityUpdatedEvent',
        ];
    }
}
